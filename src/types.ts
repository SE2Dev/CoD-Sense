'use strict'

class RawRange
{
    first_line: number;
    last_line: number;
    first_column: number;
    last_column: number;
}

class Branch
{
    type: string;
    range: RawRange;
}