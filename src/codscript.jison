
/* description: CoDScript JISON File */

/*
	Notes:
	
    GSC Supports:
		Switch Statements
		Ternary Operator
			
	GSC Does NOT Support:
		Initializer Lists
*/

/* Lexical Grammar */
%lex
%%
	
\s+						/* skip whitespace */
"//".*					/* skip single line comments */	
"/*"(.|\n|\r)*?"*/"		/* skip block comment */
"/#"(.|\n|\r)*?"#/"		/* skip devscript (for now) */

\".*\"|\'.*\'			return 'STRING_LITERAL'
\d+\.(?:\d*)?f?			return 'FLOAT_LITERAL'
\d+						return 'INTEGER_LITERAL'

"("			return '('
")"			return ')'
"["			return '['
"]"			return ']'
"{"			return '{'
"}"			return '}'
","			return ','
"."			return '.'
"!"			return '!'
"%"			return '%'
"=="		return '=='
"="			return '='
"<<"		return '<<'
"<="		return '<='
"<"			return '<'
">>"		return '>>'
">="		return '>='
">"			return '>'
"++"		return '++'
"+="		return '+='
"+"			return '+'
"--"		return '--'
"-="		return '-='
"-"			return '-'
"*="		return '*='
"*"			return '*'
"/="		return '/='
"/"			return '/'
":"			return ':'
";"			return ';'
"?"			return '?'
"@"			return '@'
//"#"			return '#'

"if"				return 'IF'
"else"				return 'ELSE'
"switch"			return 'SWITCH'
"case"				return 'CASE'
"break"				return 'BREAK'
"for"				return 'FOR'
"while"				return 'WHILE'
"continue"			return 'CONTINUE'
"return"			return 'RETURN'

(\w+[/\\])+\w+		return 'FILEPATH'
_?[a-zA-Z\-_]\w*	return 'IDENTIFIER'

"#include"			return 'INCLUDE'
"#using_animtree"	return 'USING_ANIMTREE'
"wait"				return 'WAIT'

<<EOF>>				return 'EOF'
.					return 'INVALID'

/lex

/* Operator Associations and Precendence */
/* There's nothing here right now... */

%start Program

%%
/* Language Grammar */

StringLiteral:
	STRING_LITERAL
		{
			$$ = $1.substring(1, $1.length-1);
		}
	;

NumericLiteral
	: INTEGER_LITERAL
	| FLOAT_LITERAL
	;

IncludeDirective:
	INCLUDE FILEPATH ";"
		-> {"type": "include", "arg": $2, "range": @$}
	;

AnimtreeDirective:
	USING_ANIMTREE "(" StringLiteral ")" ";"
		-> {"type": "animtree", "arg": $3, "range": @$}
	;

FormalParameterList
	: IDENTIFIER
		{
			$$ = [$1];
		}
	| FormalParameterList "," IDENTIFIER
		{
			$$ = $1.concat($3);
		}
	|
		{
			$$ = [];
		}
	;

FunctionParameterList
	: Expression
		{
			$$ = [$1];
		}
	| FunctionParameterList "," Expression
		{
			$$ = $1.concat($3);
		}
	|
		{
			$$ = [];
		}
	;

FunctionExpression
	: IDENTIFIER "(" FunctionParameterList ")"
		-> {"type": "call", "name": $1, "params": $3};
	;

Expression
	: FunctionExpression
	| NumericLiteral
	| StringLiteral
	;

ExpressionStatement
	: Expression ";"
		{
			$$ = $1;
		} //being debugged
	;

ReturnStatement
	: RETURN ";"
		-> {"type": "return"};
	| RETURN Expression ";"
		-> {"type": "return", "expression": $2};
	;
	
EmptyStatement:
	";"
	;

Statement
	: ExpressionStatement
	| ReturnStatement
	| EmptyStatement
	;

StatementList
	: StatementList Statement
		{
			$$ = $1.concat($2);
		}
	|
		{
			$$ = [];	
		}
	;

FunctionDeclaration:
	IDENTIFIER "(" FormalParameterList ")" "{" StatementList "}"
		-> {"type": "function", "name": $1, "params": $3, "range": @$, "statements": $6};
	;

SourceElement
	: IncludeDirective
	| AnimtreeDirective
	| FunctionDeclaration
	;
	
SourceElements
	: SourceElements SourceElement
		{
			//for(var key in @2) $2[key]=@2[key];
            $$ = $1.concat($2);
		}
	|
		{
			$$ = [];
		}
	;

Program:
	SourceElements EOF 
	{
		return $$;
	};
