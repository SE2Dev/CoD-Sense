%{
	#include <stdio.h>
	#include "gsc.tab.hpp"

	#define YY_DECL int yylex()
	#define YY_USER_ACTION yy_update_loc();
		
	void yy_update_loc()
	{
		yylloc.first_line = yylloc.last_line;
		yylloc.first_column = yylloc.last_column;
		
		for(int i = 0; yytext[i] != '\0'; i++)
		{
			if(yytext[i] == '\n')
			{
				yylloc.last_line++;
				yylloc.last_column = 0;
			}
			else
			{
				yylloc.last_column++;
			}
		}
	}	
%}

%option noyywrap
%option yylineno

RX_T_STRING			\"(?:\\.|[^\"])*?\"|\'(?:\\.|[^\'])*?\'
RX_T_FLOAT			[0-9]+\.(?:[0-9]*)?f?|\.[0-9]+f?
RX_T_INT			[0-9]+
RX_T_IDENTIFIER		\_?[a-zA-Z\-_]\w*

%%

\s+					/* skip whitespace */
"//".*				/* skip single line comments */	
"/*"(.|\n|\r)*?"*/"	/* skip block comment */
"/#"(.|\n|\r)*?"#/"	/* skip devscript (for now) */

{RX_T_STRING}			{ printf("T_STRING, "); return T_STRING; }
{RX_T_FLOAT}			{ printf("T_FLOAT, "); return T_FLOAT; }
{RX_T_INT}				{ printf("T_INT, "); return T_INT; }

"#include"				{ printf("INCLUDE, "); return INCLUDE; }
"#using_animtree"		{ printf("USING_ANIMTREE, "); return USING_ANIMTREE; }
"#animtree"				{ printf("ANIMTREE, "); return ANIMTREE; }

\(			{ printf("OP_LPAREN, "); return OP_LPAREN; }
\)			{ printf("OP_RPAREN, "); return OP_RPAREN; }
\[\s*\[		{ printf("FUNC_POINTER_BEGIN, "); return FUNC_POINTER_BEGIN; }
\[			{ printf("OP_LBRACKET, "); return OP_LBRACKET; }	/*
\]\s*\]		{ printf("FUNC_POINTER_END, "); return FUNC_POINTER_END; } //Using this would override ']' in nested array expressions */
\]			{ printf("OP_RBRACKET, "); return OP_RBRACKET; }
\{			{ printf("OP_LBRACE, "); return OP_LBRACE; }
\}			{ printf("OP_RBRACE, "); return OP_RBRACE; }
\,			{ printf("OP_COMMA, "); return OP_COMMA; }
\.			{ printf("OP_DOT, "); return OP_DOT; }
\!\=		{ printf("OP_CMP_NEQ, "); return OP_CMP_NEQ; }
\!			{ printf("OP_NOT, "); return OP_NOT; }
%			{ printf("OP_MOD, "); return OP_MOD; }
\=\=		{ printf("OP_CMP_EQ, "); return OP_CMP_EQ; }
\=			{ printf("OP_ASSIGN, "); return OP_ASSIGN; }
\<\<		{ printf("OP_LSHIFT, "); return OP_LSHIFT; }
\<\=		{ printf("OP_CMP_LE, "); return OP_CMP_LE; }
\<			{ printf("OP_CMP_LT, "); return OP_CMP_LT; }
\>\>		{ printf("OP_RSHIFT, "); return OP_RSHIFT; }
\>\=		{ printf("OP_CMP_GE, "); return OP_CMP_GE; }
\>			{ printf("OP_CMP_GT, "); return OP_CMP_GT; }
\+\+		{ printf("OP_INC, "); return OP_INC; } //neither post nor pre
\+\=		{ printf("OP_ASSIGN_ADD, "); return OP_ASSIGN_ADD; }
\+			{ printf("OP_ADD, "); return OP_ADD; }
\-\-		{ printf("OP_DEC, "); return OP_DEC; } //neither post nor pre
\-\=		{ printf("OP_ASSIGN_SUB, "); return OP_ASSIGN_SUB; }
\-			{ printf("OP_SUB, "); return OP_SUB; }
\*\=		{ printf("OP_ASSIGN_MULT, "); return OP_ASSIGN_MULT; }
\*			{ printf("OP_MULT, "); return OP_MULT; }
\/=			{ printf("OP_ASSIGN_DIV, "); return OP_ASSIGN_DIV; }
\/			{ printf("OP_DIV, "); return OP_DIV; }
\|\|		{ printf("OP_CMP_OR, "); return OP_CMP_OR; }
\|\=		{ printf("OP_ASSIGN_BW_OR, "); return OP_ASSIGN_BW_OR; }
\|			{ printf("OP_BW_OR, "); return OP_BW_OR; }
\&\&		{ printf("OP_CMP_AND, "); return OP_CMP_AND; }
\&\=		{ printf("OP_ASSIGN_BW_AND, "); return OP_ASSIGN_BW_AND; }
\&			{ printf("OP_BW_AND, "); return OP_BW_AND; }
\^\=		{ printf("OP_ASSIGN_BW_XOR, "); return OP_ASSIGN_BW_XOR; }
\^			{ printf("OP_BW_XOR, "); return OP_BW_XOR; }
\~			{ printf("OP_BW_NOT, "); return OP_BW_NOT; }
\:\:		{ printf("OP_COLON_DOUBLE, "); return OP_COLON_DOUBLE; }
\:			{ printf("OP_COLON, "); return OP_COLON; }
\;			{ printf("OP_COLON_SEMI, "); return OP_COLON_SEMI; }
\?			{ printf("OP_QMARK, "); return OP_QMARK; } /*
// \@		{ printf("OP_AT, "); return OP_AT; } //disabled*/
\#			{ printf("OP_HASH, "); return OP_HASH; }

"if"			{ printf("T_IF, "); return T_IF; }
"else"			{ printf("T_ELSE, "); return T_ELSE; }
"switch"		{ printf("T_SWITCH, "); return T_SWITCH; }
"case"			{ printf("T_CASE, "); return T_CASE; }
"default"		{ printf("T_DEFAULT, "); return T_DEFAULT; }
"break"			{ printf("T_BREAK, "); return T_BREAK; }
"for"			{ printf("T_FOR, "); return T_FOR; }
"while"			{ printf("T_WHILE, "); return T_WHILE; }
"continue"		{ printf("T_CONTINUE, "); return T_CONTINUE; }
"return"		{ printf("T_RETURN, "); return T_RETURN; }

"thread"			{ printf("T_THREAD, "); return T_THREAD; }
"wait"				{ printf("T_WAIT, "); return T_WAIT; }

(\w+\\)+\w+			{ printf("T_FILEPATH, "); return T_FILEPATH; }
{RX_T_IDENTIFIER}	{ printf("T_IDENTIFIER, "); return T_IDENTIFIER; }

[.]			{ fprintf(stderr, "Unrecognized Token!, ");  return T_INVALID; } 
<<EOF>>		{ return T_EOF; }

%%
