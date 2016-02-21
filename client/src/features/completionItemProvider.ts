'use strict';
import * as vscode from 'vscode';
import * as funcDefs from '../defs/defs'

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
    
    provideCompletionItems(document, position, token): vscode.CompletionItem[]
    {
        return this.completionItems;
    }
}