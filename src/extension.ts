'use strict';
import * as vscode from 'vscode';
import * as completion from './features/completionItemProvider'

import {
	ServerOptions, NodeModule, TransportKind,
	LanguageClient, LanguageClientOptions, SynchronizeOptions,
	RequestType
} from 'vscode-languageclient';

import * as request from './request'

export var server: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
	console.log("CoD-Sense: Init");

	// Register the built-in function definitions
	vscode.languages.registerCompletionItemProvider("gsc",
		new completion.functionProvider(context.extensionPath));
	vscode.languages.registerCompletionItemProvider("gsc",
		new completion.propertyProvider(context.extensionPath), ".");
}

export function deactivate() {
	console.log("CoD-Sense: Free");
}