'use strict';

import {
    SymbolInformation, SymbolKind,
    Location, Range, Position
} from "vscode-languageserver"

import {connection, console} from '../server'

export interface IBranch
{
    type: string;
    range: Range;
    children?: IBranch[]; // {}
}

export namespace NRange
{
    export function ContainsPosition(range: Range, pos: Position): boolean {
        if (pos.line < range.start.line || pos.line > range.end.line )
            return false;
        if (pos.line == range.start.line && pos.character < range.start.character)
            return false;
        if (pos.line == range.end.line  && pos.character > range.end.character)
            return false;
        return true;
    }
        
    export function ContainsRange(range: Range, arg: Range): boolean {
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
    
    export function ContainsRange(branch: IBranch, range: Range): boolean
    {
        if(!branch || branch.range == undefined)
            return false;
        return NRange.ContainsRange(branch.range, range);
    }
}
