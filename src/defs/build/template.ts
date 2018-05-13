
export class Def_Function
{
    name: string;
    decl: string;
    callon: string;
    desc: string;
    reqArgs: string[];
    optArgs: string[];
    example: string;

    constructor()
    {
        this.name = "";
        this.decl = "";
        this.callon = "";
        this.desc = "";
        this.reqArgs = [];
        this.optArgs = [];
        this.example = "";
    }
};

export var defs = new Array<Def_Function>();
