
/* description: CoDScript JISON File */

/*
	Notes:
	
    GSC Supports:
		Ternary Operator
			
	GSC Does NOT Support:
		Initializer Lists
*/

/* Lexical Grammar */
%lex
%%
	
\s+					/* skip whitespace */
"//".*				/* skip single line comments */	
<<EOF>>				return 'EOF'
.					return 'INVALID'

/lex

/* Operator Associations and Precendence */
/* There's nothing here right now... */

%start Program

%%
/* Language Grammar */

Program:
	;
