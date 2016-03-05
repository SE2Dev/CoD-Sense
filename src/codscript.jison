
/* description: CoDScript JISON File */

/*
	Notes:
	
    GSC Supports:
		Switch Statements
		Ternary Operator
		~, &=, |=, ^=, |, &, ^
			
	GSC Does NOT Support:
		Initializer Lists
		~=, <<=, >>=, %=, etc.
*/

/* Lexical Grammar */
%lex
RX_STRING_LITERAL \".*?\"|\'.*?\'
%%
	
\s+						/* skip whitespace */
"//".*					/* skip single line comments */	
"/*"(.|\n|\r)*?"*/"		/* skip block comment */
"/#"(.|\n|\r)*?"#/"		/* skip devscript (for now) */

[\s*[.*]\s*]

\&{RX_STRING_LITERAL}	return "STRING_LOCALIZED_LITERAL";
{RX_STRING_LITERAL}		return 'STRING_LITERAL'
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
"!="		return '!='
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
"||"		return '||'
"|="		return '|='
"|"			return '|'
"&&"		return '&&'
"&="		return '&='
"&"			return '&'
"^="		return '^='
"^"			return '^'
"~"			return '~'
"::"		return '::'
//":"			return ':'
";"			return ';'
"?"			return '?'
//"@"			return '@'
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

"thread"			return 'THREAD'

(\w+[/\\])+\w+		return 'FILEPATH'
_?[a-zA-Z\-_]\w*	return 'IDENTIFIER'

"#include"			return 'INCLUDE'
"#using_animtree"	return 'USING_ANIMTREE'
"wait"				return 'WAIT'

<<EOF>>				return 'EOF'
.					return 'INVALID'

/lex

/* Operator Associations and Precendence */
// Based on: http://en.cppreference.com/w/c/language/operator_precedence

%left "++" "--" "[" "]" "." //Postfixes
%right "++" "--" UPLUS UMINUS "!" "~" //Prefixes
%left "*" "/" "%"
%left "+" "-"
%left "<<" ">>"
%left "<" "<=" ">" ">="
%left "==" "!="
%left "&"
%left "^"
%left "|"
%left "&&"
%left "||"
%right "=" "+=" "-=" "*=" "/=" "&=" "^=" "|="

%start Program

%%
/* Language Grammar */

StringLiteral
	: STRING_LITERAL
		{
			$$ = $1.substring(1, $1.length-1);
		}
	| STRING_LOCALIZED_LITERAL
		{
			$$ = $1.substring(2, $1.length-1);
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

Block
	: "{" StatementList "}"
		-> {"type": "block", "content": $2, "range": @$};
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

FunctionCall
	: IDENTIFIER "(" FunctionParameterList ")"
		-> {"type": "call", "name": $1, "params": $3};
	| THREAD IDENTIFIER "(" FunctionParameterList ")"
		-> {"type": "thread", "name": $1, "params": $4};
	| PointerExpression "(" FunctionParameterList ")"
		-> {"type": "call", "name": $1, "params": $3};
	| THREAD PointerExpression "(" FunctionParameterList ")"
		-> {"type": "call", "name": $1, "params": $3};
	| FILEPATH "::" IDENTIFIER "(" FunctionParameterList ")"
		-> {"type": "call_external", "file": $1, "name": $3, "params": $5};
	;

FunctionExpression
	: IDENTIFIER FunctionCall
		{
			$$ = $2;
			$$.caller = $1;	
		}
	| FunctionCall
	;

PointerExpression
	: "[" "[" ObjectExpression "]" "]"
	;

ArrayElementExpression
	: "[" Expression "]"
	//| PointerExpression
	;

PropertyExpression
	: "." ObjectExpression
	;

MemberExpression
	: ObjectExpression ArrayElementExpression
		-> {"type": "array", "expression": $1, "member": $2}
	| ObjectExpression PropertyExpression
		-> {"type": "class", "expression": $1, "member": $2}
	;

ElementList
	: Expression "," Expression //Lists must have at least two elements
		{
			$$ = [$1, $3];
		}
	| ElementList "," Expression
		{
			$$ = $1.concat($3);
		}
	;

ListExpression
	: "(" ElementList ")"
		-> {"type": "list", "elements": $2}
	;

ObjectExpression
	: IDENTIFIER
	| FunctionExpression
	| MemberExpression
	;
	
LiteralExpression
	: NumericLiteral
	| StringLiteral
	;

OptionalExpression
	: Expression
	| 
		{
			$$ = [];
		}
	;

BasicExpression
	: ObjectExpression
	| LiteralExpression
	| ListExpression //used for things like vectors
	;

OperatorPostfix
	: "++"
	| "--"
	;
	
OperatorPrefix
	: "++"
	| "--"
	| "+"
	| "-"
	| "~"
	| "!"
	;
	
OperatorMid
	: "*"
	| "/"
	| "%"
	| "+"
	| "-"
	| "<<"
	| ">>"
	| "<"
	| "<="
	| ">"
	| ">="
	| "=="
	| "!="
	| "&"
	| "|"
	| "&&"
	| "||"
	| "="
	| "+="
	| "-="
	| "*="
	| "/="
	| "&="
	| "^="
	| "|="
	;

e
	: BasicExpression
	/*|e "." ObjectExpression
		-> {"A": $1, "property": $2, "B": $3};*/
	| e OperatorPostfix
		-> {"A": $1, "Postfix Op": $2};
	| OperatorPrefix e
		-> {"A": $1, "Prefix Op": $2};
	| e OperatorMid e
		-> {"A": $1, "Mid Op": $2, "B": $3};
	| '(' e ')'
        -> {"A": $1, "PARENS": $2, "B": $3};
	;

Expression
	: e
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

IfStatement
	: IF "(" Expression ")" Statement
		{
			$$ = yytext;
		}
	| ELSE IF "(" Expression ")" Statement
		{
			$$ = yytext;
		}
	| ELSE "(" Expression ")" Statement
		{
			$$ = yytext;
		}
	;

LoopStatement
	: WHILE "(" Expression ")" Statement
		{
			$$ = yytext;
		}
	| FOR "(" OptionalExpression ";" OptionalExpression ";" OptionalExpression ")" Statement
		{
			$$ = yytext;
		}
	;

Statement
	: Block
	| ExpressionStatement
	| IfStatement
	| LoopStatement
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
