'use strict'
import {console, connection} from "../server"
import {    DidOpenTextDocumentParams, DidChangeTextDocumentParams,
            Location, Range, Position } from "vscode-languageserver"

import {StripDirectory} from '../util/path';
import * as ast from "../analyzer"

//
// Upon Opening a Document - Perform Background Analysis
//
export function DidOpenTextDocumentHandler(params: DidOpenTextDocumentParams): void
{
    ast.analyzeDocument(params.uri, params.text).then(
        (result) => {
            if (result)
                console.log(`Analyzed: ${params.uri}`);
            else {
                connection.window.showErrorMessage(`Could not analyze '${StripDirectory(params.uri)}'`);
            }
        }
    );
}

export function DidChangeTextDocumentHandler(params: DidChangeTextDocumentParams): void
{
    params.contentChanges[0].range
    console.log("Edit:");
    params.contentChanges.forEach((v) =>
    {
       console.log(`"${v.text}" [${v.text.length}] from (${v.range.start.line}, ${v.range.start.character}) to (${v.range.end.line}, ${v.range.end.character})`)
    });
}