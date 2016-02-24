'use strict';
import * as vscode from 'vscode';
import {completionItemProvider} from './features/completionItemProvider'

import {
	ServerOptions, NodeModule, TransportKind,
	LanguageClient, LanguageClientOptions, SynchronizeOptions,
	RequestType
} from 'vscode-languageclient';

import {CoDSenseContentRequest, CoDSenseWorkspaceUrisRequest} from './request'

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
	
	server.onRequest(CoDSenseContentRequest.type, (uri_string: string) => {
		let uri = vscode.Uri.parse(uri_string);
		return vscode.workspace.openTextDocument(uri).then(
			doc => {
				return doc.getText();
			}, error => {
				return Promise.reject(error);
			});
	});

	server.onRequest(CoDSenseWorkspaceUrisRequest.type, (languageId: string) => {
		let include = "**/*." + languageId;
		return vscode.workspace.findFiles(include, "").then(
			files => {
				var out = new Array<string>();
				for(var i = 0; i < files.length; i++)
				{
					out.push(files[i].fsPath);
				}
				
				return out;
			}, error => {
				return Promise.reject(error);
			});
	});
}

export function deactivate()
{
	console.log("Free: 'CoD-Sense'");
}