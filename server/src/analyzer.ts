'use strict';

import {connection, console} from './server'
import {CoDSenseContentRequest} from './request'

import {PathToURI} from "./util/uri"

import * as branch from "./ast/branch"
import * as cache from "./ast/cache"
import * as tree from "./ast/tree"

import {
    SymbolInformation, SymbolKind,
    Location, Range, Position
} from "vscode-languageserver"

import Path = require("path");
import fs = require("fs");

var parser = require("./parser/codscript");


console.log("Init: Analyzer");

export function analyzeNewDocument(uri: string, contents?: string) {
    if (cache.IsCached(uri))
        return;

    analyzeDocument(uri, contents);
}

export function analyzeDocument(uri: string, contents?: string): Thenable<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        if (!contents) {
            console.log(`REQUEST: Contents for ${Path.basename(uri)}`);
            connection.sendRequest(CoDSenseContentRequest.type, uri).then
                (
                    function(receivedValue) //Resolved
                    {
                        console.log(`RESOLVE: Contents for ${Path.basename(uri)} - Length: ${receivedValue.length}`);
                        resolve(PerformDocumentAnalysis(uri, receivedValue));
                    },
                    function(rejectReason) //Rejected
                    {
                        console.log(`REJECT: Contents for ${Path.basename(uri)}: ${rejectReason}`);
                        reject(false);
                    }
                )
        }
        
        //
        // This point is reached on one of two conditions:
        //      1: Contents were provided via an argument
        //      2: Contents have been recieved via the request
        //
        let result = PerformDocumentAnalysis(uri, contents);
        
        //Theoretically if you removed this the function wouldn't exit because the promise was never resolved
        resolve(result);
    });
}

//Deprecated
var gfiles;
function executeLoop(index) {
    analyzeDocumentSync(gfiles[index]);
    if (index++ < gfiles.length)
        setTimeout(executeLoop, 1000, index);
};

//Deprecated
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
        return PerformDocumentAnalysis(uri, contents);
    }

    return false;
}

function PerformDocumentAnalysis(uri: string, text: string) {
    var parseTime = NaN;
    var genTime = NaN;

    try {
        var startTime = new Date().getTime();
        cache.Add(uri, parser.parse(text));
        var endTime = new Date().getTime();
        parseTime = endTime - startTime;
        
        startTime = new Date().getTime();
        tree.GenerateRelativeData(uri);
        endTime = new Date().getTime();
        genTime = endTime - startTime;
        
    } catch (err) {
        console.error(`ERROR: Could not parse '${Path.basename(uri)}'`);
        console.error(err.message);
        return false;
    }

    console.log(`PARSED: ${Path.basename(uri)} in ${parseTime + genTime} ms (${parseTime} ms + ${genTime} ms)`);
    return true;
}
