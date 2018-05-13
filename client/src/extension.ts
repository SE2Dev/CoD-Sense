'use strict';
import * as vscode from 'vscode';
import { completionItemProvider } from './features/completionItemProvider'

import {
	ServerOptions, NodeModule, TransportKind,
	LanguageClient, LanguageClientOptions, SynchronizeOptions,
	RequestType
} from 'vscode-languageclient';

import * as request from './request'

export var server: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
	console.log("Init: 'CoD-Sense'");

	// Register the built-in function definitions
	//vscode.languages.registerCompletionItemProvider("gsc", new completionItemProvider())
	vscode.languages.registerCompletionItemProvider("gsc", new completionItemProvider(context.extensionPath), "\\");
}

export function deactivate() {
	console.log("Free: 'CoD-Sense'");
}