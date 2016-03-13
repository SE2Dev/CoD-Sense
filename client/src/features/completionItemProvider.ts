'use strict';
import * as vscode from 'vscode';
import * as funcDefs from '../defs/defs'

import {server} from "../extension"
import {CoDSenseResolveDirectoryRequest} from "../request"

var rxIncludeDirective_Part = /include\s+(\w[\w\\]*\\)/;

export class completionItemProvider
{
    completionItems:vscode.CompletionItem[];
    
    constructor()
    {
        this.completionItems = new Array<vscode.CompletionItem>();
       
        for(var i in funcDefs.defs)
        {
            var idef = funcDefs.defs[i];
            
            var def = new vscode.CompletionItem(idef.name);
            def.detail = idef.decl;
            def.documentation = idef.desc;
            def.kind = vscode.CompletionItemKind.Function;
            this.completionItems.push(def);
        }
    }
    
    provideCompletionItems(document: vscode.TextDocument, position, token): vscode.CompletionItem[]
	{
        if (document.getText()[document.offsetAt(position) - 1] == "\\") {
            let r = rxIncludeDirective_Part.exec(document.lineAt(position).text);
            if (r.length <= 1)
                return null;

				console.log(r.length);
				console.log(r[1]);

            return server.sendRequest(CoDSenseResolveDirectoryRequest.type, r[1]).then
			(
				function(files) //Resolved
				{
					console.log("RESOLVE");
					let completionItems: vscode.CompletionItem[] = [];
					
					for(var i = 0; i < files.length; i++)
					{
						let completionItem = new vscode.CompletionItem(files[i]);
						completionItem.kind = vscode.CompletionItemKind.File;
						
						completionItems.push(completionItem);
					}
					
					console.log(completionItems);
					return completionItems;
				},

				function(rejectReason) //Rejected
				{
					console.error("Rejected!" + rejectReason);
					let completionItems: vscode.CompletionItem[] = [];
					return completionItems;
				}
			);
        }
        //console.log(c);
        
    }
}