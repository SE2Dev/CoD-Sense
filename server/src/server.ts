'use strict';

import {
     IConnection, createConnection,
     IPCMessageReader, IPCMessageWriter,
     TextDocumentSyncKind,
	 ServerCapabilities, InitializeResult,
     SymbolInformation, SymbolKind,
     Location, Range, Position
} from "vscode-languageserver"

let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
var console = connection.console;
console.log("Connect: 'CoD-Sense Server'");

//
// The server gets re-initialized every time the workspace changes and the extension is activated
//
connection.onInitialize((params): InitializeResult =>
{
    console.log("Init: 'CoD-Sense Server'");
    
    let workspaceRoot = params.rootPath;
    let serverFeatures: ServerCapabilities =
    {
        textDocumentSync: TextDocumentSyncKind.Full,
        documentSymbolProvider: true
    }

	return {capabilities: serverFeatures};
});

connection.onDidOpenTextDocument((params) => 
{
    ParseDocument(params.uri, params.text);
});

connection.onDidChangeConfiguration((params) => 
{
    //connection.console.log(params.settings);
});

connection.onDocumentSymbol((params) => 
{
    var startTime = new Date().getTime();
    
    var symbols = new Array<SymbolInformation>();
    
    let uri = params.uri;
    
    let lines = DOC_TREE[uri].lines;
    for(var i = 0; i < lines.length; i++)
    {
        //console.log(lines[i]);
        
        for(var t = 0; t < lines[i].tokens.length; t++)
        {
            var token = lines[i].tokens[t];
            for(var s = 1; s < token.scopes.length; s++)
            {
                //console.log(token.scopes[s]);
                if(token.scopes[s] == "entity.name.function.c")
                {
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
                        uri: params.uri,
                        range: {start: p1, end: p2}
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
    console.log("Found Symbols in " + (endTime - startTime) + "ms");
    
    return symbols;
});

connection.listen();




//////////////////////////////////////////////////////////

/*
    TODO:
        Find a better way to locate the tmLanguage file
*/

import {BuiltInModule, extensionPath, StripDirectory} from './util/path';

var Registry = require(BuiltInModule("vscode-textmate")).Registry;
var registry = new Registry();
var grammar = registry.loadGrammarFromPathSync(extensionPath + "syntaxes/gsc.tmLanguage");

var DOC_TREE = {};
var DOC_COUNTER = 0;

function ParseDocument(uri: string, text: string)
{  
    var startTime = new Date().getTime();
    
    DOC_TREE[uri] = {};
    DOC_TREE[uri].index = DOC_COUNTER++;
    DOC_TREE[uri].uri = uri;
    DOC_TREE[uri].lines = new Array();

    var lines = text.split("\r\n");

    var ruleStack = null;
    for (var i = 0; i < lines.length; i++) {
        DOC_TREE[uri].lines[i] = {};
        DOC_TREE[uri].lines[i].text = lines[i];
        
        var r = grammar.tokenizeLine(lines[i], ruleStack);
        //console.log('Line: #' + i + ', tokens: ' + r.tokens);
        DOC_TREE[uri].lines[i].tokens = r.tokens;
        //console.log('Line: #' + i + ', tokens: ' + DOC_TREE[uri].lines[i].tokens);
        ruleStack = r.ruleStack;
    }
    
    var endTime = new Date().getTime();
    console.log("Parsed " + StripDirectory(uri) + " in " + (endTime - startTime) + "ms");
}