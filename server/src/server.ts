'use strict';
import * as vss from "vscode-languageserver"

import {
    IConnection, createConnection,
    IPCMessageReader, IPCMessageWriter,
    TextDocumentSyncKind, 
    ServerCapabilities, InitializeResult
} from "vscode-languageserver"

//
// Connect to the Language Client
//
export var connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
export var console = connection.console;
console.log("Connect: 'CoD-Sense Server'");

import * as vfs from "./util/vfs";

//
// The server gets re-initialized every time the workspace changes and the extension is activated
//
connection.onInitialize((params): InitializeResult => {
    console.log("Init: 'CoD-Sense Server'");

    let workspaceRoot = params.rootPath;
    let serverFeatures: ServerCapabilities =
        {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            documentSymbolProvider: false,
            workspaceSymbolProvider: false,
            completionProvider: { triggerCharacters: ["."] }
        }

    vfs.InitializeWorkspace(params.rootPath);

    return { capabilities: serverFeatures };
});

import {provideDocumentSymbols, provideWorkspaceSymbols} from "./features/symbolProvider"
import {DidOpenTextDocumentHandler, DidCloseTextDocumentHandler, DidChangeTextDocumentHandler} from "./features/documentHandler"
import {DidChangeConfigurationHandler} from "./features/configurationHandler"
import {CompletionHandler} from "./features/completionHandler"

//connection.onDidOpenTextDocument(DidOpenTextDocumentHandler);
//connection.onDidChangeTextDocument(DidChangeTextDocumentHandler);
//connection.onCompletion(CompletionHandler);
//connection.onDidCloseTextDocument(DidCloseTextDocumentHandler)

connection.onDidChangeConfiguration(DidChangeConfigurationHandler);

connection.onDocumentSymbol(provideDocumentSymbols);
connection.onWorkspaceSymbol(provideWorkspaceSymbols);

import {CoDSenseResolveDirectoryRequest} from "./request"
connection.onRequest(CoDSenseResolveDirectoryRequest.type, (path: string) => {
    return Promise.resolve(vfs.ResolveDirectoryContents(path));
});

connection.listen();
