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
    rel: RRange;
}

export class RRange
{
    offset: Position;
    length: Position;
}

export namespace NPos
{
    export function Translate(origin: Position, delta: Position): Position
    {
        let out = {line: origin.line, character: origin.character};
        if(delta.line == 0)
            out.character += delta.character;
        else
        {
            out.line += delta.line;
            out.character = delta.character;
        }
        
        return out;
    }
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
    
    export function RelativeToSelf(me) {
        var out: RRange = { "offset": { "line": 0, "character": 0 }, "length": { "line": 0, "character": 0 } };
        out.offset.line = me.start.line;
        out.offset.character = me.start.character;

        out.length.line = me.end.line - me.start.line;
        out.length.character = out.length.line ? me.end.character : me.end.character - me.start.character;

        return out;
    }

    export function RelativeToSibling(me, sibling) {
        var out: RRange = { "offset": { "line": 0, "character": 0 }, "length": { "line": 0, "character": 0 } };

        out.offset.line = me.start.line - sibling.end.line;
        out.offset.character = out.offset.line ? me.start.character : me.start.character - sibling.end.character;

        out.length.line = me.end.line - me.start.line;
        out.length.character = out.length.line ? me.end.character : me.end.character - me.start.character;

        return out;
    }

    export function RelativeToParent(me, parent) {
        var out: RRange = { "offset": { "line": 0, "character": 0 }, "length": { "line": 0, "character": 0 } };

        out.offset.line = me.start.line - parent.start.line;
        out.offset.character = out.offset.line ? me.start.character : me.start.character - parent.start.character;

        out.length.line = me.end.line - me.start.line;
        out.length.character = out.length.line ? me.end.character : me.end.character - me.start.character;

        return out;
    }
    
    export function Absolute(me: RRange, origin: Position): Range
    {
        let start = NPos.Translate(origin, me.offset);
        let end = NPos.Translate(start, me.length);
        return Range.create(start, end);
    }
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
    
    export function AbsoluteRange(me: IBranch, origin: Position): Range
    {
        return NRange.Absolute(me.rel, origin);
    }
}
