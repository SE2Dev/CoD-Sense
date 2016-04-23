'use strict';
import * as vscode from 'vscode';
import {TextDocument, CancellationToken, SymbolInformation} from 'vscode'

import {server} from "../extension"

import Path = require("path");
import cp = require('child_process');

export class documentSymbolProvider
{
    parserPath: string;
    
	constructor(extensionPath)
	{
        this.parserPath = Path.join(extensionPath, "../parser/parser.exe");
	}
	
	provideDocumentSymbols(document: TextDocument, token: CancellationToken): SymbolInformation[] | Thenable<SymbolInformation[]>
	{
		return new Promise<SymbolInformation[]>((resolve, reject) => {
			let symbols: SymbolInformation[] = [];

			var parser = cp.spawn(this.parserPath, ["symbols"]);

			parser.stdin.on('error', (error) => {
				console.warn("Ignoring stdin error in parser.exe");
			});

			parser.stdout.on('data', (data) => {
				var file_str = `${data}`;
				var lines = file_str.split("\n");
				for (var i = 0; i < lines.length; i++) {
					var str = lines[i].split("|");
					
					// Temp Fix for Non-Symbol Data
					if (str.length <= 2)
						continue;


					//
					// Subtract 1 from the line number until parser build-chain
					// properly supports the respective preprocessor value
					//
                    var locData = str[2].split(" ");
                    let range = new vscode.Range(
                        Number(locData[0]) - 1,
                        Number(locData[1]),
                        Number(locData[2]) - 1,
                        Number(locData[3]));

					let symbol = new SymbolInformation(str[1], vscode.SymbolKind.Function, range, document.uri);
					symbols.push(symbol);
				}
			});

			parser.stderr.on('data', (data) => {
				console.error(`${data}`);
			});

			parser.on('close', (code) => {
				console.log(`Parser Exit: ${code}`);
				resolve(symbols);
			});

			if(parser.pid)
			{
				parser.stdin.write(document.getText());
				parser.stdin.end();
			}
			else
			{
				console.error("Could not launch parser");
			}
		});
	}
}