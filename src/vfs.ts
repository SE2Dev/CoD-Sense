'use strict'

import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';
import { CompletionItem } from "vscode-languageclient/lib/main";

export const gameDir = "D:\\Games\\steamapps\\common\\Call of Duty Black Ops\\raw\\"

export enum VirtualPathType {
	VP_INVALID,
	VP_DIRECTORY,
	VP_FILE
}

let targetPaths: string[] = []; //An array of paths from highest priority to lowest priority

export function InitializeWorkspace(workspaceFolders: vscode.WorkspaceFolder[] | undefined) {
	if (workspaceFolders === undefined || workspaceFolders.length < 1)
		return;

	const workspacePath = workspaceFolders[0].uri.fsPath;
	if (!workspacePath || workspacePath == "")
		return;

	/*
	switch(workspacePath[workspacePath.length-1])
	{
		case "/":
		case "\\":
			break;
			
		default:
			workspacePath += "\\";
	} 
	*/

	targetPaths.unshift(workspacePath)
}

/**
 * Add an absolute path to the targetPaths
 */
export function AddPath(path: string) {
	if (targetPaths.indexOf(path) == -1) {
		console.log(`VFS: Register Path: '${path}'`);
		targetPaths.push(path);
	}
}

/**
 * Remove an absolute path from the targetPaths
 */
export function RemovePath(path: string) {
	let i = targetPaths.indexOf(path);
	if (i > -1) {
		console.log(`VFS: Unregister Path: '${path}'`);
		targetPaths.splice(i, 1);
	}
}

/**
 * Remove all targetPaths except the workspacePath
 */
export function ResetPaths(path: string) {
	while (targetPaths.length > 1) {
		console.log(`VFS: Unregister Path: '${targetPaths[targetPaths.length - 1]}'`);
		targetPaths.pop();
	}
}

/**
 * Provide information regarding a virtual path
 */
export function ValidatePath(path: string): VirtualPathType {
	for (var i = 0; i < targetPaths.length; i++) {
		try {
			let stat = fs.lstatSync(targetPaths[i] + path);
			if (stat.isFile())
				return VirtualPathType.VP_FILE;
			if (stat.isDirectory())
				return VirtualPathType.VP_DIRECTORY;
		}
		catch (err) {
			continue;
		}
	}

	return VirtualPathType.VP_INVALID;
}

/**
 * Resolve an absolute file path from a virtual path - returns null if none could be resolved
 */
export function ResolveFilePath(path: string) {
	for (var i = 0; i < targetPaths.length; i++) {
		try {
			let absPath = targetPaths[i] + path;
			let stat = fs.lstatSync(absPath);

			if (stat.isFile())
				return absPath;
		}
		catch (err) {
			continue;
		}
	}

	console.warn(`VFS: Couldn't resolve virtual file path: '${path}'`);
	return null;
}

/**
 * Resolve the contents of a virtual directory
 */
export function ResolveDirectoryContents(dir: string): string[] {
	let contents: string[] = [];

	for (var i = 0; i < targetPaths.length; i++) {
		try {
			let absPath = path.join(targetPaths[i], dir);
			let stat = fs.lstatSync(absPath);

			if (stat.isDirectory())
				contents = contents.concat(fs.readdirSync(absPath).filter(function (val) {
					return contents.indexOf(val) == -1;
				}));
		}
		catch (err) {
			continue;
		}
	}

	return contents;
}

export function ResolvePathCompletion(dir: string): vscode.CompletionItem[] {
	let completions: vscode.CompletionItem[] = [];

	let names: string[] = [];
	for (let targetPath of targetPaths) {
		let absPath = path.join(targetPath, dir);

		try {
			let stat = fs.lstatSync(absPath);

			// Skip the include dir if it doesn't exist
			if (!stat.isDirectory)
				continue;

			let r = fs.readdirSync(absPath).filter(function (val) {
				return names.indexOf(val) == -1;
			})

			names = names.concat(r);

			for (let name of r) {
				let c = new vscode.CompletionItem(name);
				let filepath = path.join(absPath, name);
				stat = fs.lstatSync(filepath);


				if (stat.isFile()) {
					// Skip all non-gsc files
					if (!name.endsWith(".gsc"))
						continue
					c.kind = vscode.CompletionItemKind.File;
					c.insertText = name.replace(/\.[^/.]+$/, "");
				} else if (stat.isDirectory()) {
					c.kind = vscode.CompletionItemKind.Folder;
					c.insertText = name + "\\";
				}

				c.detail = filepath;

				completions.push(c);
			}

		}
		catch (err) {
			continue;
		}
	}

	return completions;
}