'use strict';
import * as vscode from 'vscode';

import * as funcDefs from '../defs/defs'
import * as fieldDefs from '../defs/field'

import { server } from "../extension"
import { CoDSenseResolveDirectoryRequest } from "../request"

import Path = require("path");
import cp = require('child_process');

var rxFilepath = /([_\w]+\\)+[_\w]*/;

// Provides function completion
export class functionProvider {
	functions: vscode.CompletionItem[];

	// Generate completion items for the hardcoded functions
	constructor(extensionPath) {
		this.functions = new Array<vscode.CompletionItem>();

		for (var i in funcDefs.defs) {
			var idef = funcDefs.defs[i];

			var def = new vscode.CompletionItem(idef.name);
			def.detail = idef.decl;
			def.documentation = idef.desc;
			def.kind = vscode.CompletionItemKind.Function;
			this.functions.push(def);
		}
	}

	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token): Thenable<vscode.CompletionItem[]> | vscode.CompletionItem[] {
		//
		// Present the user with a list of common GSC / CSC functions
		//
		return new Promise<vscode.CompletionItem[]>((resolve, reject) => {
			// Dynamically resolved completion items
			let funcItems: vscode.CompletionItem[] = [];

			if (vscode.workspace.getConfiguration("cod-sense").get("use_builtin_completionItems", true)) {
				// Fallback to just using the built-in completion items if no dynamic ones were found
				if (!funcItems.length) {
					resolve(this.functions);
				}

				resolve(this.functions.concat(funcItems));
			}

			// Use the non-builtin results (current none)
			resolve(funcItems);
		});
	}
}

export class propertyProvider {
	props: vscode.CompletionItem[];

	// Generate completion items for the hardcoded functions
	constructor(extensionPath) {
		this.props = new Array<vscode.CompletionItem>();

		for (var i in fieldDefs.fields) {
			var def = new vscode.CompletionItem(fieldDefs.fields[i]);
			def.kind = vscode.CompletionItemKind.Field;
			this.props.push(def);
		}
	}

	provideCompletionItems(document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		context: vscode.CompletionContext): Thenable<vscode.CompletionItem[]> | vscode.CompletionItem[] {


		//
		// Present the user with a list of common GSC / CSC functions
		//
		return new Promise<vscode.CompletionItem[]>((resolve, reject) => {
			// Don't provide completion unless it's enabled
			if (!vscode.workspace.getConfiguration("cod-sense").get("use_builtin_completionItems", true))
				reject();

			// Don't provide the property completionItems unless we were activated by the trigger character
			if (context.triggerKind != vscode.CompletionTriggerKind.TriggerCharacter)
				reject();

			// Dynamically resolved completion items
			let propItems: vscode.CompletionItem[] = [];

			resolve(this.props);
		});
	}
}