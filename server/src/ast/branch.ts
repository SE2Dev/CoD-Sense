'use strict';

import {
    SymbolInformation, SymbolKind,
    Location, Range, Position
} from "vscode-languageserver"

import {connection, console} from '../server'

export interface IJRange
{
    first_line: number;
    last_line: number;
    first_column: number;
    last_column: number;
}

export interface IBranch
{
    type: string;
    range: IJRange;
    children?: IBranch[] | {};
}

export namespace NRange
{
    export function ContainsPosition(range: IJRange, pos: Position): boolean {
        if (pos.line < range.first_line - 1 || pos.line > range.last_line - 1)
            return false;
        if (pos.line == range.first_line - 1 && pos.character < range.first_column)
            return false;
        if (pos.line == range.last_line - 1 && pos.character > range.last_column)
            return false;
        return true;
    }
    
    export function ConvertToRange(range: IJRange): Range
    {
        let p1: Position = {    line: range.first_line - 1,
                                character: range.first_column };
        let p2: Position = {    line: range.last_line - 1,
                                character: range.last_column };
        return { start: p1, end: p2 };
    };
        
    export function ContainsJRange(range: IJRange, arg: IJRange): boolean {
        return ContainsRange(range, ConvertToRange(range));
    };
        
    export function ContainsRange(range: IJRange, arg: Range): boolean {
        if (ContainsPosition(range, arg.start) && ContainsPosition(range, arg.end))
            return true;
        return false;
    };
}

export namespace NBranch
{
    export function ContainsPosition(branch: IBranch, pos: Position)
    {
        if(!branch || branch.range == undefined)
            return false;
        return NRange.ContainsPosition(branch.range, pos);
    }
    
    export function ContainsJRange(branch: IBranch, range: IJRange): boolean
    {
        if(!branch || branch.range == undefined)
            return false;
        return NRange.ContainsJRange(branch.range, range); 
    }
    
    export function ContainsRange(branch: IBranch, range: Range): boolean
    {
        if(!branch || branch.range == undefined)
            return false;
        return NRange.ContainsRange(branch.range, range);
    }
}
