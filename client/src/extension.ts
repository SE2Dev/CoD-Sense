'use strict';
import * as vscode from 'vscode';
import {completionItemProvider} from './features/completionItemProvider'

import {
	ServerOptions, NodeModule, TransportKind,
	LanguageClient, LanguageClientOptions, SynchronizeOptions
} from 'vscode-languageclient';

export function activate(context: vscode.ExtensionContext)
{
	console.log("Init: 'CoD-Sense'");
	
	// Register the built-in function definitions
	vscode.languages.registerCompletionItemProvider("gsc", new completionItemProvider())
	
	let module = context.asAbsolutePath("server/server.js");
	
	// Uses the NodeModule settings for the server options
	let debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };
	
	let releaseModule: NodeModule = { module: module, transport: TransportKind.ipc };
	let debugModule: NodeModule = { module: module, transport: TransportKind.ipc, options: debugOptions };

	let serverOptions: ServerOptions = { run: releaseModule, debug: debugModule };
	
	// Syncronize the "codsense" configuration section to the language server
	let syncOptions: SynchronizeOptions = {	configurationSection: "codsense" };
	let clientOptions: LanguageClientOptions = {documentSelector: ["gsc"], synchronize: syncOptions};
	
	let server = new LanguageClient("codsense", serverOptions, clientOptions);
	var disposable = server.start();
	context.subscriptions.push(disposable);
}

export function deactivate()
{
	console.log("Free: 'CoD-Sense'");
}