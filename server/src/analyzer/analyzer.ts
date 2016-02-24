'use strict';

import {connection, console} from '../server'
import {CoDSenseContentRequest} from '../request'
var docTree = {};

console.log("Init: Analyzer");

export function isCached(uri: string)
{
    return docTree[uri] != undefined;
}

export function remove(uri: string)
{
    delete docTree[uri];
}

export function analyzeNewDocument(uri: string, contents?: string)
{
    if(isCached(uri))
        return;
        
    analyzeDocument(uri, contents);
}

export function analyzeDocument(uri: string, contents?: string): Thenable<void>
{
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

import {PathToURI} from "../util/uri"
var fs = require('fs');
export function analyzeDocumentSync(path: string, contents?: string) {
    
    if (!contents)
        contents = fs.readFileSync(path, 'utf-8');;

    if (contents.length) {
        let uri = PathToURI(path);
        PerformDocumentAnalysis(uri, contents);
    }
}

import {BuiltInModule, extensionPath, StripDirectory} from '../util/path';
var grammar = require("./grammar");

function PerformDocumentAnalysis(uri: string, text: string)
{  
    var startTime = new Date().getTime();
    
    docTree[uri] = {};
    //docTree[uri].index = DOC_COUNTER++;
    docTree[uri].uri = uri;
    docTree[uri].lines = new Array();

    var lines = text.split("\r\n");

    var ruleStack = null;
    for (var i = 0; i < lines.length; i++) {
        docTree[uri].lines[i] = {};
        docTree[uri].lines[i].text = lines[i];

        var r = grammar.tokenizeLine(lines[i], ruleStack);
        //console.log('Line: #' + i + ', tokens: ' + r.tokens);
        docTree[uri].lines[i].tokens = r.tokens;
        //console.log('Line: #' + i + ', tokens: ' + docTree[uri].lines[i].tokens);
        ruleStack = r.ruleStack;
    }
    
    var endTime = new Date().getTime();
    console.log("Parsed " + StripDirectory(uri) + " in " + (endTime - startTime) + "ms");
}

import {
     SymbolInformation, SymbolKind,
     Location, Range, Position
} from "vscode-languageserver"

export function GetDocumentTokensMatchingScope(uri: string, scope: string) //""
{
    var startTime = new Date().getTime();

    var symbols = new Array<SymbolInformation>();

    let lines = docTree[uri].lines;
    for (var i = 0; i < lines.length; i++) {
        //console.log(lines[i]);
        
        for (var t = 0; t < lines[i].tokens.length; t++) {
            var token = lines[i].tokens[t];
            for (var s = 1; s < token.scopes.length; s++) {
                //console.log(token.scopes[s]);
                if (token.scopes[s] == scope) {
                    let name: string = lines[i].text;
                    name = name.substr(token.startIndex, token.endIndex - token.startIndex);

                    let p1: Position =
                        {
                            line: i,
                            character: token.startIndex
                        }

                    let p2: Position =
                        {
                            line: i,
                            character: token.endIndex
                        }

                    let loc: Location =
                        {
                            uri: uri,
                            range: { start: p1, end: p2 }
                        }

                    let symbol: SymbolInformation =
                        {
                            name: name,
                            kind: SymbolKind.Function,
                            location: loc
                        }

                    symbols.push(symbol);
                }
            }
        }
    }

    var endTime = new Date().getTime();
    console.log("Found " +  symbols.length + " Symbols in " + (endTime - startTime) + "ms");

    return symbols;
}

export function GetWorkspaceTokensMatchingScope(scope: string)
{
    var out: SymbolInformation[];
    
    var i = 0;
    for(var uri in docTree)
    {
        if(i == 0)
        {
            out = GetDocumentTokensMatchingScope(uri, scope);
        }
        else
        {
            var docSymbols = GetDocumentTokensMatchingScope(uri, scope);
            out = out.concat(docSymbols);
        }

        i++;
    }
    
    return out;
}