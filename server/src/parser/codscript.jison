
/* description: stuff */

/* lexical grammar */
%lex
%%

\s+                     /* skip whitespace */
\/\/.*                  /* skip comment */
"/*"(.|\n|\r)*?"*/"     /* skip block comment */
"/#"(.|\n|\r)*?"#/"     /* skip devscript */
\".*\"|\'.*\'           return 'STRING'
";"                     return 'SEMICOLON'
(\w+[/\\])+\w+          return 'FILEPATH'
_?[a-zA-Z\-_]\w*        return 'IDENTIFIER'
"#include"              return 'INCLUDE'
"#using_animtree"       return 'USING_ANIMTREE'
"("                     return '('
")"                     return ')'
"{"                     return '{'
"}"                     return '}'
","                     return ','
"="                     return '='
<<EOF>>                 return 'EOF'
.                       return 'INVALID'

/lex

/* operator associations and precedence */
%left '+' '-'

%start Program

%% /* language grammar */


String:
    STRING
    {
        $$ = $1.substring(1, $1.length-1);
    }
    ;

Anything:
    STRING | SEMICOLON | FILEPATH | IDENTIFIER | "(" | ")" | "," | "=" | INVALID
    ; 

/* Only Apply in the Global scope */

IncludeDirective:
    INCLUDE FILEPATH SEMICOLON -> {"type": "include", "name": $2}
    ;
    
UsingAnimtreeDirective:
    USING_ANIMTREE "(" String ")" SEMICOLON -> {"type": "using_animtree", "name": $3}
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
    BlockElements
    ;

FunctionDeclaration
    : IDENTIFIER "(" FormalParameterList ")" "{" FunctionBody "}"
       $$ -> {"type": "function", "name": $1, "arguments": $3}
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

BlockContent:
    "{" BlockElements "}"
    ;

BlockElement
    : Anything | BlockContent;

BlockElements
    : BlockElements BlockElement
        {
            //for(var key in @2) $2[key]=@2[key];
            //$$ = $1.concat($2);
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
