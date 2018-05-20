'use strict';
import * as vscode from 'vscode';
import * as completion from './features/completionItemProvider';

import * as vfs from './vfs';

// import * as request from './request'

export function activate(context: vscode.ExtensionContext) {
	console.log("CoD-Sense: Init");

	// Register the built-in function definitions
	vscode.languages.registerCompletionItemProvider("gsc",
		new completion.functionProvider(context.extensionPath));
	vscode.languages.registerCompletionItemProvider("gsc",
		new completion.propertyProvider(context.extensionPath), ".");
		vscode.languages.registerCompletionItemProvider("gsc",
		new completion.fileProvider(context.extensionPath), "\\");

	//vscode.workspace.onDidChangeWorkspaceFolders((e: vscode.WorkspaceFoldersChangeEvent) => {
	//	console.log(e);
	//	//if (e.added.length) {
	//	//	try {
	//	//		vscode.workspace.getConfiguration('files', e.added[0].uri).get('exclude');
	//	//	} catch (e) {
	//	//		console.log(e);
	//	//	}
	//	//}
	//	//if (e.removed.length) {
	//	//	try {
	//	//		vscode.workspace.getConfiguration('files', e.removed[0].uri).get('exclude');
	//	//	} catch (e) {
	//	//		console.log(e);
	//	//	}
	//	//}
	//});

	vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
			console.log(e);
	});

	//context.workspaceState.get(

	vfs.InitializeWorkspace(vscode.workspace.workspaceFolders);
	vfs.AddPath(vfs.gameDir);

	// console.log(vfs.ResolveDirectoryContents("maps"))

	//vfs.InitializeWorkspace(vscode.workspace.getWorkspaceFolder(

	//vfs.InitializeWorkspace(vscode.workspace.getWorkspaceFolder());
}

export function deactivate() {
	console.log("CoD-Sense: Free");
}