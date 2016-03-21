'use strict'

import {console} from "../server"

import {
    SymbolInformation, SymbolKind,
    Location, Range, Position
} from "vscode-languageserver"

import * as cache from "./cache";
import {IBranch, NRange, NBranch} from "./branch";

export interface Tree
{
    branches: IBranch[]
};

function ResolveElementInternal(pos: Position, branch: IBranch)
{      
    if(!NBranch.ContainsPosition(branch, pos))
        return null;
    
    if(branch.children == undefined)
        return branch;
      
    if(branch.children.length == undefined)
    {
        for(var key in branch.children)
        {
            if(NBranch.ContainsPosition(branch.children[key], pos))
            {
                //If this returns null it has no idea where youre typing (should only occur between functions)
                return ResolveElementInternal(pos, branch.children[key]);
            }
        }
        return branch;
    }
    
    for(var i = 0; i < branch.children.length; i++)
    {
        if(NBranch.ContainsPosition(branch.children[i], pos))
        {
            //If this returns null it has no idea where youre typing (should only occur between functions)
            return ResolveElementInternal(pos, branch.children[i]);
        }
    }
    
    return branch;
}

export function ResolveElement(uri: string, pos: Position)
{   
    let result = null;
    for(var i = 0; i < cache.Item(uri).length; i++)
    {
        if(!NBranch.ContainsPosition(cache.Item(uri)[i], pos))
            continue;
        
        result = ResolveElementInternal(pos, cache.Item(uri)[i]);
        if(result)
            return result;
    }
    
    return null;
}

export function ResolveFunctionSymbols(uri: string)
{   
    var item = null;
    let symbols: SymbolInformation[] = [];
    for(var i = 0; i < cache.Item(uri).length; i++)
    {
        item = cache.Item(uri)[i];
        if(item.type != "function")
            continue;
        
        let name: string = item.children.identifier.name;
        let symbol = SymbolInformation.create(name, SymbolKind.Function, item.range);
        symbols.push(symbol);
    }
    
    return symbols;
}