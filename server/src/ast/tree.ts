'use strict'

import {console} from "../server"

import {
    SymbolInformation, SymbolKind,
    Location, Range, Position
} from "vscode-languageserver"

import * as cache from "./cache";
import {IBranch, NPos, NRange, NBranch} from "./branch";

export interface Tree
{
    branches: IBranch[]
};

//
// Resolve functions, etc. from clean / unmodified documents
//
export function ResolveFunctionSymbols_Clean(uri: string)
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

function ResolveElementInternal_Clean(pos: Position, branch: IBranch)
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
                return ResolveElementInternal_Clean(pos, branch.children[key]);
            }
        }
        return branch;
    }
    
    for(var i = 0; i < branch.children.length; i++)
    {
        if(NBranch.ContainsPosition(branch.children[i], pos))
        {
            //If this returns null it has no idea where youre typing (should only occur between functions)
            return ResolveElementInternal_Clean(pos, branch.children[i]);
        }
    }
    
    return branch;
}

export function ResolveElement_Clean(uri: string, pos: Position)
{   
    let result = null;
    for(var i = 0; i < cache.Item(uri).length; i++)
    {
        if(!NBranch.ContainsPosition(cache.Item(uri)[i], pos))
            continue;
        
        result = ResolveElementInternal_Clean(pos, cache.Item(uri)[i]);
        if(result)
            return result;
    }
    
    return null;
}


//
// Generate Relative Location Data
//
function GenerateRelativeDataInternal(branch: IBranch, lastRange: Range)
{   
    if(!branch || branch.range === undefined)
    {
        return null;
    }
     
    if(lastRange == null)
        branch.rel = NRange.RelativeToSelf(branch.range);
    else if(NRange.ContainsRange(lastRange, branch.range))
        branch.rel = NRange.RelativeToParent(branch.range, lastRange);
    else
        branch.rel = NRange.RelativeToSibling(branch.range, lastRange);
    
    if(branch.children == undefined)
        return null;
    
    let last = branch.range;
    if(branch.children.length == undefined)
    {
        
        for(var key in branch.children)
        {
            if(!branch.children[key] || branch.children[key].range == undefined)
                continue;
            
            GenerateRelativeDataInternal(branch.children[key], last);
            last = branch.children[key].range;
        }
    }
    else
    {
        for(var i = 0; i < branch.children.length; i++)
        {
            if(!branch.children[i] || branch.children[i].range == undefined)
                continue;
                
            GenerateRelativeDataInternal(branch.children[i], last);
            last = branch.children[i].range;
        }
    }
    
    return branch;
}

export function GenerateRelativeData(uri: string)
{   
    let result = null;
    let lastRange = null;
    
    for(var i = 0; i < cache.Item(uri).length; i++)
    {     
        GenerateRelativeDataInternal(cache.Item(uri)[i], lastRange);
        lastRange = cache.Item(uri)[i].range;
    }

    return null;
}

//
// Resolve cache elements by relative lookup
//
function ResolveElementInternal_Relative(pos: Position, branch: IBranch, origin: Position)
{   
    if(!branch || branch.rel == undefined)
        return null;
        
    let range = NRange.Absolute(branch.rel, origin);
    if(!NRange.ContainsPosition(range, pos))
        return null;
               
    if(branch.children == undefined)
        return {"node": branch, "range": range};
    
    let orig = range.start;  
    if(branch.children.length == undefined)
    {
        for(var key in branch.children)
        {
            //console.warn(key);
            if(branch.children[key].rel == undefined)
                continue;
            
            let crange = NRange.Absolute(branch.children[key].rel, orig);
            //console.log(crange);
            //console.log(branch.children[key]);
            if(NRange.ContainsPosition(crange, pos))
            {
                //If this returns null it has no idea where youre typing (should only occur between functions)
                return ResolveElementInternal_Relative(pos, branch.children[key], orig);
            }
            orig = crange.end;
        }
    }

    for(var i = 0; i < branch.children.length; i++)
    {
        //console.error(i);
        let crange = NRange.Absolute(branch.children[i].rel, orig);
        if(NRange.ContainsPosition(crange, pos))
        {
            //If this returns null it has no idea where youre typing (should only occur between functions)
            return ResolveElementInternal_Relative(pos, branch.children[i], orig);
        }
        orig = crange.end;
    }
    
    //console.warn(JSON.stringify(range));
    //console.log(branch);
    return null;
}

export function ResolveElement_Relative(uri: string, pos: Position)
{   
    let result = null;
    let origin = {line: 0, character: 0};
    for(var i = 0; i < cache.Item(uri).length; i++)
    {
        let branch = cache.Item(uri)[i];
        
        result = ResolveElementInternal_Relative(pos, cache.Item(uri)[i], origin);
        if(result)
            return result;
            
        origin = NPos.Translate(origin, cache.Item(uri)[i].rel.offset);
        origin = NPos.Translate(origin, cache.Item(uri)[i].rel.length);
    }
    
    return null;
}