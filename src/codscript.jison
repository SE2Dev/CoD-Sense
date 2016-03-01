
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
\d+\.(?:\d*f)?			return 'FLOAT_LITERAL'
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
"="			return '='
"++"		return '++'
"+"			return '+'
"--"		return '--'
"-"			return '-'
"*"			return '*'
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
//.					return 'INVALID'

/lex

/* Operator Associations and Precendence */
/* There's nothing here right now... */

%start Program

%%
/* Language Grammar */

Program:
	;
