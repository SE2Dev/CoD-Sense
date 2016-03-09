'use strict'

//
// Utility
//
enum BranchType
{   
    StringLiteral,
    NumericLiteral,
    Identifier,
     
    FunctionDeclaration,
    IncludeDirective,
    AnimtreeDirective,
    
    Block
};

export class JRange
{
    first_line: number;
    last_line: number;
    first_column: number;
    last_column: number;
}

export class Branch
{
    type: BranchType;
    range: JRange;
    
    constructor(range: JRange) {
        this.range = range;
    }
}

//
// Literals
//
export class Identifier extends Branch
{
    value: any;
    
    constructor(range: JRange, value: any ) {
        super(range);
        this.type = BranchType.Identifier;
        this.value = value;
    }
}

//
// Global Scope
//
export class FunctionDeclaration extends Branch
{
    name: Identifier;
    parameters: Identifier[];
    block: Block;
    
    constructor(range: JRange, params: Identifier[], block: Block)
    {
        super(range);
        this.type = BranchType.FunctionDeclaration;
    }
}

//
// Context Dependent
//
export class Block extends Branch
{
    statements: any[];
    constructor(range: JRange)
    {
        super(range);
        this.type = BranchType.Block;
    }
}