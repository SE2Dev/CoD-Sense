'use strict';

import {
    SymbolInformation, SymbolKind,
    Location, Range, Position
} from "vscode-languageserver"

import {connection, console} from '../server'

export var SymbolKindMap =
{
    //The active file:  SymbolKind.File
    
    "include":          SymbolKind.File,
    "using_animtree":   SymbolKind.String,
    
    "function":         SymbolKind.Function,
    "var":              SymbolKind.Variable,

    "const":            SymbolKind.Constant,
    "bool":             SymbolKind.Boolean,
    "number":           SymbolKind.Number,
    "string":           SymbolKind.String,
    
    "property":         SymbolKind.Property
}

function GetChildKeyForBranchType(type: string): string
{
    switch(type)
    {
        case "function":
            return "statements";
    }
    
    return null;
}

export class BranchRange
{
    first_line: number;
    last_line: number;
    first_column: number;
    last_column: number;
    any: any;
    
    Range(): Range
    {
        let p1: Position = { line: this.first_line - 1,
                             character: this.first_column };
        let p2: Position = { line: this.last_line - 1,
                             character: this.last_column };
        return { start: p1, end: p2 };
    };
    
    ContainsPosition(pos: Position): boolean
    {
        if (pos.line < this.first_line || pos.line > this.last_line)
            return false;
        if (pos.line == this.first_line && pos.character < this.first_column)
            return false;
        if (pos.line == this.last_line && pos.character < this.last_column)
            return false;
        return true;
    };
    
    ContainsRange(range: Range): boolean
    {
        if(this.ContainsPosition(range.start) && this.ContainsPosition(range.end))
            return true;
        return false;
    };
}

export class Branch
{
    type: string;
    range: BranchRange;
  
    Range(): Range {
        return this.range.Range();
    };
    
    ContainsPosition(pos: Position): boolean {
        return this.range.ContainsPosition(pos);
    };

    ContainsRange(range: Range): boolean {
        return this.range.ContainsRange(range);
    };
    
    Children(): Array<any>
    {
        let key: string = GetChildKeyForBranchType(this.type);
        
        if(!key)
            return undefined;
        
        if(this[key] == undefined)
            throw("ERROR: Couldnt Get Child With Key: '" + key + "' for Object: " + this + "\n");
        
        if(this[key].length != undefined)
            return this[key];
        
        return [this[key]];
    }
}

//
// Interface for Include / UsingAnimtree Directives
//
export interface IBranch_Directive extends Branch
{
    arg: string[];
};

export interface IBranch_Block extends Branch
{
    statements: string[];
};

export interface IBranch_FunctionDecl extends Branch, IBranch_Block
{
    name: string;
    params: string[];
};