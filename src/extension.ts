'use strict';
import * as vscode from 'vscode';
import {completionItemProvider} from './features/completionItemProvider'

export function activate(context: vscode.ExtensionContext)
{
	console.log('Init: "CoD-Sense"');
	
	vscode.languages.registerCompletionItemProvider("gsc", new completionItemProvider())
}

export function deactivate()
{
}