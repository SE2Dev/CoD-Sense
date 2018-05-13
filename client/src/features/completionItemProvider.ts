'use strict';
import * as vscode from 'vscode';
import * as funcDefs from '../defs/defs'

import { server } from "../extension"
import { CoDSenseResolveDirectoryRequest } from "../request"

import Path = require("path");
import cp = require('child_process');

var rxFilepath = /([_\w]+\\)+[_\w]*/;

export class completionItemProvider {
	completionItems: vscode.CompletionItem[];

	constructor(extensionPath) {
		this.completionItems = new Array<vscode.CompletionItem>();

		for (var i in funcDefs.defs) {
			var idef = funcDefs.defs[i];

			var def = new vscode.CompletionItem(idef.name);
			def.detail = idef.decl;
			def.documentation = idef.desc;
			def.kind = vscode.CompletionItemKind.Function;
			this.completionItems.push(def);
		}
	}

	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token): Thenable<vscode.CompletionItem[]> | vscode.CompletionItem[] {
		//
		// Present the user with a list of common GSC / CSC functions
		//
		return new Promise<vscode.CompletionItem[]>((resolve, reject) => {
			resolve(this.completionItems);
		});
	}
}