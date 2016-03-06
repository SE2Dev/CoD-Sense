'use strict';

import * as server from "vscode-languageserver"
import {StripDirectory} from './util/path';

import {
     IConnection, createConnection,
     IPCMessageReader, IPCMessageWriter,
     TextDocumentSyncKind, DidChangeTextDocumentParams,
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
        textDocumentSync: TextDocumentSyncKind.Incremental,
        documentSymbolProvider: true,
        workspaceSymbolProvider: true
    }

	return {capabilities: serverFeatures};
});

import * as ast from "./analyzer"

connection.onDidChangeTextDocument((params: DidChangeTextDocumentParams) =>
{
    params.contentChanges[0].range
    console.log("Edit:");
    params.contentChanges.forEach((v) =>
    {
       console.log(`"${v.text}" [${v.text.length}] from (${v.range.start.line}, ${v.range.start.character}) to (${v.range.end.line}, ${v.range.end.character})`)
    });
   
});


//
// Upon Opening a Document - Perform Background Analysis
//
connection.onDidOpenTextDocument((params) => 
{
    ast.analyzeDocument(params.uri, params.text).then(
        (result) =>
        {
            if(result)
                console.log(`Analyzed: ${params.uri}`);
            else
            {
                connection.window.showErrorMessage(`Could not analyze '${StripDirectory(params.uri)}'`);
            }
        }
    );
});

import {CoDSenseWorkspaceUrisRequest} from './request'
import {sleep} from './util/utility'

connection.onDidChangeConfiguration((params) => {
    connection.sendRequest(CoDSenseWorkspaceUrisRequest.type, "gsc").then
        (
            function(files) //Resolved
            {
                ast.analyzeWorkspace(files);
            },
            function(rejectReason) //Rejected
            {
                console.error("Rejected! - Couldn't get the workspace file list");
                return;
            }
        )
});

connection.onDocumentSymbol((params) => {
    return ast.GetDocumentTokensMatchingScope(params.uri, "entity.name.function.c");
});

connection.onWorkspaceSymbol((params) => {
    var startTime = new Date().getTime();
    var out = ast.GetWorkspaceTokensMatchingScope("entity.name.function.c");
    var endTime = new Date().getTime();
    console.log("Found " + out.length + " Workspace Symbols in " + (endTime - startTime) + "ms");
    return out;
});

connection.listen();
