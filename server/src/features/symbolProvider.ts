'use strict'
import {console} from "../server"
import Path = require("path")
import {    SymbolInformation, SymbolKind,
            Location, Range, Position } from "vscode-languageserver"

import * as ast from "../analyzer"
import * as tree from "../ast/tree"

export function provideDocumentSymbols(params): SymbolInformation[]
{
    var startTime = new Date().getTime();
    let symbols = tree.ResolveFunctionSymbols(params.uri);
    var endTime = new Date().getTime();
    console.log(`PROVIDER: Found ${symbols.length} symbols for '${Path.basename(params.uri)}' in ${endTime - startTime} ms`);
    return symbols;
}

export function provideWorkspaceSymbols(params): SymbolInformation[]
{
    var startTime = new Date().getTime();
    var out = null;
    var endTime = new Date().getTime();
    console.log("Found " + out.length + " Workspace Symbols in " + (endTime - startTime) + "ms");
    return out;
}