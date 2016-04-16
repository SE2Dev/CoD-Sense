'use strict';
import * as vscode from 'vscode';
import * as funcDefs from '../defs/defs'

import {server} from "../extension"
import {CoDSenseResolveDirectoryRequest} from "../request"

import Path = require("path");
import cp = require('child_process');

var rxIncludeDirective_Part = /include\s+(\w[\w\\]*\\)/;

export class completionItemProvider
{
	completionItems:vscode.CompletionItem[];
	parserPath: string;
	
	constructor(extensionPath)
	{
		this.completionItems = new Array<vscode.CompletionItem>();
	   
		console.log(extensionPath);
	   	
		this.parserPath = Path.join(extensionPath, "../parser/parser.exe");
	   
		for(var i in funcDefs.defs)
		{
			var idef = funcDefs.defs[i];
			
			var def = new vscode.CompletionItem(idef.name);
			def.detail = idef.decl;
			def.documentation = idef.desc;
			def.kind = vscode.CompletionItemKind.Function;
			this.completionItems.push(def);
		}
	}
	
	provideCompletionItems(document: vscode.TextDocument, position, token): Thenable<vscode.CompletionItem[]> | vscode.CompletionItem[]
	{
		//
		// If a file path is being typed - present the user with a list of files in the directory they have entered
		//
		if (document.getText()[document.offsetAt(position) - 1] == "\\")
		{
			let r = rxIncludeDirective_Part.exec(document.lineAt(position).text);
			if (r.length <= 1)
				return null;
			
			return server.sendRequest(CoDSenseResolveDirectoryRequest.type, r[1]).then
			(
				function(files) //Resolved
				{
					//console.log("RESOLVE");
					let completionFiles: vscode.CompletionItem[] = [];
					
					for(var i = 0; i < files.length; i++)
					{
						let extension = Path.extname(files[i]);
						let file = Path.basename(files[i], extension)
						
						switch(extension.toUpperCase())
						{
							case ".GSC":
							case ".CSC":
							{
								let completionItem = new vscode.CompletionItem(file);
								completionItem.kind = vscode.CompletionItemKind.File;
								completionItem.detail = files[i];
						
								completionFiles.push(completionItem);
								continue;
							}
							case "":
							{
								let completionItem = new vscode.CompletionItem(file);
								completionItem.kind = vscode.CompletionItemKind.File;
								completionItem.detail = file + "\\";
						
								completionFiles.push(completionItem);
								continue;
							}
							default:
								continue;
						}
					}
					
					//console.log(completionItems);
					return completionFiles;
				},
			
				function(rejectReason) //Rejected
				{
					console.error("REJECTED" + rejectReason);
					let completionFiles: vscode.CompletionItem[] = [];
					return completionFiles;
				}
			);
		}
		
		//
		// Present the user with a list of functions from the current file
		//
		return new Promise<vscode.CompletionItem[]>((resolve, reject) => {
			let completionItems: vscode.CompletionItem[] = [];

			var parser = cp.spawn(this.parserPath, ["symbols"]);

			parser.stdin.on('error', (error) => {
				console.warn("Ignoring stdin error in parser.exe");
			});

			parser.stdout.on('data', (data) => {
				var file_str = `${data}`;
				var lines = file_str.split("\n");
				for (var i = 0; i < lines.length; i++) {
					var str = lines[i].split("|");
					
					// Temp Fix for Non-Symbol Data
					if (str.length <= 2)
						continue;

					let completionItem = new vscode.CompletionItem(str[1]);
					completionItem.kind = vscode.CompletionItemKind.Function;
					completionItem.detail = str[3];

					completionItems.push(completionItem);
				}
			});

			parser.stderr.on('data', (data) => {
				console.error(`${data}`);
			});

			parser.on('close', (code) => {
				console.log(`Parser Exit: ${code}`);
				
				if(vscode.workspace.getConfiguration("cod-sense").get("use_builtin_completionItems", true))
				{
					resolve(completionItems.concat(this.completionItems));	
				}
				else
				{
					resolve(completionItems);
				}
			});

			if(parser.pid)
			{
				parser.stdin.write(document.getText());
				parser.stdin.end();
			}
			else
			{
				console.error("Could not launch parser");
			}
		});
	}
}