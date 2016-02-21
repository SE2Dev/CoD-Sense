'use strict';

import {
     IConnection, createConnection,
     IPCMessageReader, IPCMessageWriter
} from "vscode-languageserver"

let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
connection.console.log("Init: 'CoD-Sense Server'");

connection.onDidChangeConfiguration((params) => 
{
    connection.console.log(params.settings);
});

connection.listen();