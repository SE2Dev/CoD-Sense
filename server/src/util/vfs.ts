'use strict'

import {console} from "../server";

import fs = require('fs');

export enum VirtualPathType {
	VP_INVALID,
	VP_DIRECTORY,
	VP_FILE
}

var targetPaths: string[] = []; //An array of paths from highest priority to lowest priority

export function InitializeWorkspace(workspacePath: string) {
	if(!workspacePath || workspacePath == "")
		return;
	
	switch(workspacePath[workspacePath.length-1])
	{
		case "/":
		case "\\":
			break;
			
		default:
			workspacePath += "\\";
	} 
	
	if (targetPaths.length == 0)
		targetPaths = [workspacePath];
	else
		targetPaths[0] = workspacePath;
}

/**
 * Add an absolute path to the targetPaths
 */
export function AddPath(path: string) {
	if (targetPaths.indexOf(path) == -1)
	{
		console.log(`VFS: Register Path: '${path}'`);
		targetPaths.push(path);
	}
}

/**
 * Remove an absolute path from the targetPaths
 */
export function RemovePath(path: string) {
	let i = targetPaths.indexOf(path);
	if (i > -1)
	{
		console.log(`VFS: Unregister Path: '${path}'`);
		targetPaths.splice(i, 1);
	}
}

/**
 * Remove all targetPaths except the workspacePath
 */
export function ResetPaths(path: string) {
	while (targetPaths.length > 1) {
		console.log(`VFS: Unregister Path: '${targetPaths[targetPaths.length-1]}'`);
		targetPaths.pop();
	}
}

/**
 * Provide information regarding a virtual path
 */
function ValidatePath(path: string): VirtualPathType {
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
export function ResolveDirectoryContents(path: string): string[] {
	let contents: string[] = [];
	
	for (var i = 0; i < targetPaths.length; i++) {
		try {
			let absPath = targetPaths[i] + path;
			let stat = fs.lstatSync(absPath);
			
			if(stat.isDirectory())
				contents = contents.concat(fs.readdirSync(absPath).filter(function(val) {
					return contents.indexOf(val) == -1;
				}));
		}
		catch (err) {
			continue;
		}
	}

	return contents;
}
