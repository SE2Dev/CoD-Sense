'use strict';

import {connection, console} from './server'
import {CoDSenseContentRequest} from './request'

import {
    SymbolInformation, SymbolKind,
    Location, Range, Position
} from "vscode-languageserver"

import {StripDirectory} from './util/path';
import {PathToURI} from "./util/uri"

var parser = require("./parser/codscript");
var fs = require('fs');

var docTree = {};

console.log("Init: Analyzer");

export function isCached(uri: string) {
    return docTree[uri] != undefined;
}

export function remove(uri: string) {
    delete docTree[uri];
}

export function analyzeNewDocument(uri: string, contents?: string) {
    if (isCached(uri))
        return;

    analyzeDocument(uri, contents);
}

export function analyzeDocument(uri: string, contents?: string): Thenable<void> {
    return new Promise<void>((resolve, reject) => {
        if (!contents) {
            console.log("You didnt send the file contents - attempting to get them automatically");
            connection.sendRequest(CoDSenseContentRequest.type, uri).then
                (
                function(recievedValue) //Resolved
                {
                    console.log(`Receive: Contents for ${uri} with length ${recievedValue.length}`);
                    PerformDocumentAnalysis(uri, recievedValue);
                    resolve();
                },
                function(rejectReason) //Rejected
                {
                    console.error("Rejected: '" + uri + "' " + rejectReason);
                    reject();
                }
                )
        }
        
        //
        // This point is reached on one of two conditions:
        //      1: Contents were provided via an argument
        //      2: Contents have been recieved via the request
        //
        
        PerformDocumentAnalysis(uri, contents);
        
        //Theoretically if you removed this the function wouldn't exit because the promise was never resolved
        resolve();
    });
}

var gfiles;
function executeLoop(index) {
    analyzeDocumentSync(gfiles[index]);
    if (index++ < gfiles.length)
        setTimeout(executeLoop, 1000, index);
};

export function analyzeWorkspace(files: string[]): Thenable<void> {
    return new Promise<void>((resolve, reject) => {
        var startTime = new Date().getTime();
        var index = 0;
        setTimeout(function analyzeWorkspaceDocument() {
            //console.log(`${index}: ${files[index]}`);
            analyzeDocumentSync(files[index]);

            if (++index < files.length) {
                setTimeout(analyzeWorkspaceDocument, 0);
            }
            else {
                var endTime = new Date().getTime();
                console.log("Found Workspace Symbols in " + (endTime - startTime) + "ms");
            }
        });

        resolve();
    });
}

export function analyzeDocumentSync(path: string, contents?: string) {

    if (!contents)
        contents = fs.readFileSync(path, 'utf-8');

    if (contents.length) {
        let uri = PathToURI(path);
        PerformDocumentAnalysis(uri, contents);
    }
}



function PerformDocumentAnalysis(uri: string, text: string) {
    var startTime = new Date().getTime();

    docTree[uri] = {};

    try {
        docTree[uri] = parser.parse(text);
    } catch (exception) {
        console.error("ERROR in '" + StripDirectory(uri) + "'\n" + exception.message);
    }

    var endTime = new Date().getTime();
    console.log("Parsed " + StripDirectory(uri) + " in " + (endTime - startTime) + "ms");
}





function ElemRange(elemRange): Range {
    let p1: Position =
        {
            line: elemRange.first_line - 1,
            character: elemRange.first_column
        }

    let p2: Position =
        {
            line: elemRange.last_line - 1,
            character: elemRange.last_column
        }

    return { start: p1, end: p2 };
}

var SymbolKindEnum =
{
    "include":          SymbolKind.File,
    "using_animtree":   SymbolKind.String,
    "function":         SymbolKind.Function,
}

export function GetDocumentTokensMatchingScope(uri: string, scope: string) {
    var startTime = new Date().getTime();
    var symbols = new Array<SymbolInformation>();

    for (var i = 0; i < docTree[uri].length; i++) {
        if (docTree[uri][i].type && docTree[uri][i].name) {
            let symbol: SymbolInformation =
                {
                    name: docTree[uri][i].name,
                    kind: SymbolKindEnum[docTree[uri][i].type],
                    location: { uri: uri, range: ElemRange(docTree[uri][i].range) }
                };

            if (symbols.length == 0)
                symbols = [symbol];
            else
                symbols.push(symbol);
        }
    }

    var endTime = new Date().getTime();
    console.log("Found " + symbols.length + " Symbols in " + (endTime - startTime) + "ms");

    return symbols;
}

export function GetWorkspaceTokensMatchingScope(scope: string) {
    var out: SymbolInformation[];

    var i = 0;
    for (var uri in docTree) {
        if (i == 0) {
            out = GetDocumentTokensMatchingScope(uri, scope);
        }
        else {
            var docSymbols = GetDocumentTokensMatchingScope(uri, scope);
            out = out.concat(docSymbols);
        }

        i++;
    }

    return out;
}