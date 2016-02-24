'use strict';

import {
     IConnection, createConnection,
     IPCMessageReader, IPCMessageWriter,
     TextDocumentSyncKind,
	 ServerCapabilities, InitializeResult,
     SymbolInformation, SymbolKind,
     Location, Range, Position
} from "vscode-languageserver"

export var connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
export var console = connection.console;
console.log("Connect: 'CoD-Sense Server'");

//
// The server gets re-initialized every time the workspace changes and the extension is activated
//
connection.onInitialize((params): InitializeResult =>
{
    console.log("Init: 'CoD-Sense Server'");
    
    let workspaceRoot = params.rootPath;
    let serverFeatures: ServerCapabilities =
    {
        textDocumentSync: TextDocumentSyncKind.Full,
        documentSymbolProvider: true,
        workspaceSymbolProvider: true
    }

	return {capabilities: serverFeatures};
});

import * as ast from "./analyzer/analyzer"

//
// Upon Opening a Document - Perform Background Analysis
//
connection.onDidOpenTextDocument((params) => 
{
    ast.analyzeDocument(params.uri, params.text).then
    (
        () => { console.log(`Analyzed: ${params.uri}`) }
    );
});

import {CoDSenseWorkspaceUrisRequest} from './request'
import {sleep} from './util/utility'

connection.onDidChangeConfiguration((params) => {
    connection.sendRequest(CoDSenseWorkspaceUrisRequest.type, "gsc").then
        (
            function(uris) //Resolved
            {
                console.log("Receive: " + uris.length + " files");

                var startTime = new Date().getTime();
                for (var i = 0; i < uris.length; i++) {
                    ast.analyzeDocumentSync(uris[i]);
                }

                var endTime = new Date().getTime();
                console.log("Found Workspace Symbols in " + (endTime - startTime) + "ms");
            },
            function(rejectReason) //Rejected
            {
                console.error("Rejected! - Couldn't the workspace file list");
                return;
            }
        )
});

import {GetDocumentTokensMatchingScope, GetWorkspaceTokensMatchingScope} from "./analyzer/analyzer"

connection.onDocumentSymbol((params) => {
    return GetDocumentTokensMatchingScope(params.uri, "entity.name.function.c");
});

connection.onWorkspaceSymbol((params) => {
    var startTime = new Date().getTime();
    var out = GetWorkspaceTokensMatchingScope("entity.name.function.c");
    var endTime = new Date().getTime();
    console.log("Found " + out.length + " Workspace Symbols in " + (endTime - startTime) + "ms");
    return out;
});

connection.listen();
