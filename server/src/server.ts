'use strict';

import {
     IConnection, createConnection,
     IPCMessageReader, IPCMessageWriter,
     TextDocumentSyncKind,
	 ServerCapabilities, InitializeResult,
} from "vscode-languageserver"

let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
connection.console.log("Connect: 'CoD-Sense Server'");

//
// The server gets re-initialized every time the workspace changes and the extension is activated
//
connection.onInitialize((params): InitializeResult =>
{
    connection.console.log("Init: 'CoD-Sense Server'");
    
    let workspaceRoot = params.rootPath;
    let serverFeatures: ServerCapabilities =
    {
        textDocumentSync: TextDocumentSyncKind.Full,
    }

	return {capabilities: serverFeatures};
});

connection.onDidChangeConfiguration((params) => 
{
    connection.console.log(params.settings);
});

connection.listen();