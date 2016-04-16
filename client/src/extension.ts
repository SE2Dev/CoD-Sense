'use strict';
import * as vscode from 'vscode';
import {completionItemProvider} from './features/completionItemProvider'
import {documentSymbolProvider} from './features/documentSymbolProvider'

import {
	ServerOptions, NodeModule, TransportKind,
	LanguageClient, LanguageClientOptions, SynchronizeOptions,
	RequestType
} from 'vscode-languageclient';

import * as request from './request'

export var server: LanguageClient;

export function activate(context: vscode.ExtensionContext)
{
	console.log("Init: 'CoD-Sense'");
	
	// Register the built-in function definitions
	//vscode.languages.registerCompletionItemProvider("gsc", new completionItemProvider())
	vscode.languages.registerCompletionItemProvider("gsc", new completionItemProvider(context.extensionPath), "\\");
	vscode.languages.registerDocumentSymbolProvider("gsc", new documentSymbolProvider(context.extensionPath));
	
	let module = context.asAbsolutePath("server/server.js");
	
	// Uses the NodeModule settings for the server options
	let debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };
	
	let releaseModule: NodeModule = { module: module, transport: TransportKind.ipc };
	let debugModule: NodeModule = { module: module, transport: TransportKind.ipc, options: debugOptions };

	let serverOptions: ServerOptions = { run: releaseModule, debug: debugModule };
	
	// Syncronize the "codsense" configuration section to the language server
	let syncOptions: SynchronizeOptions = {	configurationSection: "cod-sense" };
	let clientOptions: LanguageClientOptions = {documentSelector: ["gsc"], synchronize: syncOptions};
	
	server = new LanguageClient("cod-sense", serverOptions, clientOptions);
	var disposable = server.start();
	context.subscriptions.push(disposable);
	
	server.onRequest(request.CoDSenseContentRequest.type, request.HandleContentRequest);
	server.onRequest(request.CoDSenseWorkspaceUrisRequest.type, request.HandleWorkspaceUrisRequest);
}

export function deactivate()
{
	console.log("Free: 'CoD-Sense'");
}