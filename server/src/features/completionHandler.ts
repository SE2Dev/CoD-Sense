'use strict'
import {console, connection} from "../server"
import {    TextDocumentPosition, CompletionItem,
            Location, Range, Position } from "vscode-languageserver"

import Path = require("path");
import * as ast from "../analyzer"

import * as cache from '../ast/cache'
import * as tree from '../ast/tree'

//
// Upon Opening a Document - Perform Background Analysis
//
export function CompletionHandler(params: TextDocumentPosition): CompletionItem[]
{
    console.log("COMPLETION for " + JSON.stringify(params.position));
    var startTime = new Date().getTime();
    
    console.log(tree.ResolveElement_Relative(params.uri, params.position));
    var endTime = new Date().getTime();
    console.log(`COMPLETIOn RESOLVED: ${endTime - startTime} ms`);
    return null;
}