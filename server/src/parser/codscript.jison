
/* description: stuff */

/* lexical grammar */
%lex
%%

\s+                     /* skip whitespace */
\/\/.*                  /* skip comment */
"/*"(.|\n|\r)*?"*/"     /* skip block comment */
"/#"(.|\n|\r)*?"#/"     /* skip devscript */

\".*?\"|\'.*?\'         return 'STRING_LITERAL'
\d+\.(?:\d*f)?          return 'FLOAT_LITERAL'
\d+                     return 'INTEGER_LITERAL'
";"                     return ';'

"if"                    return 'IF'
"else"                  return 'ELSE'
"switch"                return 'SWITCH'
"case"                  return 'CASE'
"break"                 return 'BREAK'
"for"                   return 'FOR'
"while"                 return 'WHILE'
"continue"              return 'CONTINUE'
"return"                return 'RETURN'

"wait"                  return 'WAIT'

(\w+[/\\])+\w+          return 'FILEPATH'
_?[a-zA-Z\-_]\w*        return 'IDENTIFIER'
"#include"              return 'INCLUDE'
"#using_animtree"       return 'USING_ANIMTREE'

"("                     return '('
")"                     return ')'
"["                     return '['
"]"                     return ']'
"{"                     return '{'
"}"                     return '}'
","                     return ','
"="                     return '='
"+"                     return '+'
"-"                     return '-'
"*"                     return '*'
"/"                     return '/'
"++"                     return '++'
<<EOF>>                 return 'EOF'
.                       return 'INVALID'

/lex

/* operator associations and precedence */
%left '+' '-'

%start Program

%% /* language grammar */

/* Literals */

StringLiteral:
    STRING_LITERAL
    {
        $$ = $1.substring(1, $1.length-1);
    }
    ;

NumericLiteral:
    INTEGER_LITERAL | FLOAT_LITERAL    
    ;

Literal:
    StringLiteral | NumericLiteral
    ;


/* Expressions */

Expression:
    Literal | IDENTIFIER
    ;

/* Only Apply in the Global scope */

IncludeDirective:
    INCLUDE FILEPATH ";" -> {"type": "include", "name": $2}
    ;
    
UsingAnimtreeDirective:
    USING_ANIMTREE "(" StringLiteral ")" ";" -> {"type": "using_animtree", "name": $3}
    ;

FormalParameterList
    : "IDENTIFIER"
        {
            $$ = [$1];
        }
    | FormalParameterList "," "IDENTIFIER"
        {
            $$ = $1.concat($3);
        }
    |
        {
            $$ = [];
        }
    ;

FunctionBody:
    StatementList -> $1
    ;

FunctionDeclaration
    : IDENTIFIER "(" FormalParameterList ")" "{" FunctionBody "}"
       $$ -> {"type": "function", "name": $1, "arguments": $3, "content": $6}
    ;

SourceElement
    : IncludeDirective
    | FunctionDeclaration
    | UsingAnimtreeDirective;

SourceElements
    : SourceElements SourceElement
        {
            for(var key in @2) $2[key]=@2[key];
            $$ = $1.concat($2);
        }
    |
        {
            $$ = [];
        }
    ;

/* The following only apply within a function / block scope */

Block:
    "{" StatementList "}"
    -> {"type": "block", "content": $2}
    ;

EmptyStatement:
    ";"
    ;

ReturnStatement
    : RETURN ";"
    -> {"type": "return"}
    | RETURN Expression ";"
    -> {"type": "return", "argument": $2}
    ;

ContinueStatement
    : CONTINUE ";"
    ;
    
BreakStatement
    : BREAK ";"
    ;

ExpressionStatement: Expression ";"
    ;

Statement
    : Block
    | EmptyStatement
    | ReturnStatement
    | ContinueStatement
    | BreakStatement
    | ExpressionStatement
    ;

StatementList
    : StatementList Statement
        {
            for(var key in @2) $2[key]=@2[key];
            $$ = $1.concat($2);
        }
    |
        {
            $$ = [];
        }
    ;

Program
    : SourceElements EOF
        {
            return $$;
        }
    ;
