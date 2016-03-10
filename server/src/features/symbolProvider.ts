'use strict'
import {console} from "../server"
import {    SymbolInformation, SymbolKind,
            Location, Range, Position } from "vscode-languageserver"

import * as ast from "../analyzer"

export function provideDocumentSymbols(params): SymbolInformation[]
{
    return ast.GetDocumentTokensMatchingScope(params.uri, "entity.name.function.c");
}

export function provideWorkspaceSymbols(params): SymbolInformation[]
{
    var startTime = new Date().getTime();
    var out = ast.GetWorkspaceTokensMatchingScope("entity.name.function.c");
    var endTime = new Date().getTime();
    console.log("Found " + out.length + " Workspace Symbols in " + (endTime - startTime) + "ms");
    return out;
}