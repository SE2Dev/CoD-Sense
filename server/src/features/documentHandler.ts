'use strict'
import {console, connection} from "../server"
import {    DidOpenTextDocumentParams, TextDocumentIdentifier,
            DidChangeTextDocumentParams,
            Location, Range, Position } from "vscode-languageserver"

import Path = require("path");
import * as ast from "../analyzer"
import * as cache from '../ast/cache'

// Upon Opening a Document - Perform Background Analysis
//
export function DidOpenTextDocumentHandler(params: DidOpenTextDocumentParams): void
{
    console.log("OPEN: " + Path.basename(params.uri));
    ast.analyzeDocument(params.uri, params.text).then((result) => 
    {
        if(!result)
            connection.window.showErrorMessage(`Could not analyze '${Path.basename(params.uri)}'`);
    });
}

export function DidCloseTextDocumentHandler(params: TextDocumentIdentifier): void
{
    console.log("CLOSE: " + Path.basename(params.uri));
}

export function DidChangeTextDocumentHandler(params: DidChangeTextDocumentParams): void
{
    params.contentChanges[0].range
    console.log("EDIT: ");
    params.contentChanges.forEach((v) =>
    {
       console.log(`"${v.text}" [${v.text.length}] from (${v.range.start.line}, ${v.range.start.character}) to (${v.range.end.line}, ${v.range.end.character})`)
    });
}