
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
RX_STRING_LITERAL \"(?:\\.|[^\"])*?\"|\'(?:\\.|[^\'])*?\'
RX_IDENTIFIER \_?[a-zA-Z\-_]\w*
%%
	
\s+						/* skip whitespace */
"//".*					/* skip single line comments */	
"/*"(.|\n|\r)*?"*/"		/* skip block comment */
"/#"(.|\n|\r)*?"#/"		/* skip devscript (for now) */

{RX_STRING_LITERAL}		return 'STRING_LITERAL'
\d+\.(?:\d*)?f?|\.\d+f?	return 'FLOAT_LITERAL'
\d+						return 'INTEGER_LITERAL'

"#include"			return 'INCLUDE'
"#using_animtree"	return 'USING_ANIMTREE'
"#animtree"			return 'ANIMTREE'

"("			return '('
")"			return ')'
\[\s*\[		return 'FUNC_POINTER_BEGIN'
"["			return '['
//\]\s*\]		return 'FUNC_POINTER_END' //Using this would override ']' in nested array expressions
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
":"			return ':'
";"			return ';'
"?"			return '?'
//"@"			return '@'
"#"			return '#'

"if"				return 'IF'
"else"				return 'ELSE'
"switch"			return 'SWITCH'
"case"				return 'CASE'
"default"			return 'DEFAULT'
"break"				return 'BREAK'
"for"				return 'FOR'
"while"				return 'WHILE'
"continue"			return 'CONTINUE'
"return"			return 'RETURN'

"thread"			return 'THREAD'
"wait"				return 'WAIT'

(\w+\\)+\w+			return 'FILEPATH'
{RX_IDENTIFIER}		return 'IDENTIFIER'

<<EOF>>				return 'EOF'
.					return 'INVALID'

/lex

/* Operator Associations and Precendence */
// Based on: http://en.cppreference.com/w/c/language/operator_precedence

%left "++" "--" "[" "]" "." //Postfixes and Brackets
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

//
// For any of the following rules (in order to prevent many unneccesary type strings for basic data types)
// The member of the parent should have a identifier that describes the member type
// For example in function.file the file property will always be a FILEPATH with the standard FILEPATH structure
// This is the same for IDENTIFIERS, etc.
//
// The type prperty is only needed for these members if their presense isn't absolute
// as is the case in a rule such as:
//		MyRule: IDENTIFIER | OtherRule {...};
//

StringLiteral
	: STRING_LITERAL
		{
			$$ = $1.substring(1, $1.length-1);
		}
	| "&" STRING_LITERAL
		{
			$$ = $1.substring(2, $1.length-1);
		}
	| "#" STRING_LITERAL
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
		-> {"type": "include", "children": {"file":{"name": $2, "range": @2}}, "range": @$}
	;

AnimtreeDirective:
	USING_ANIMTREE "(" StringLiteral ")" ";"
		-> {"type": "animtree", "children": {"arg": {"name": $3, "range": @3}}, "range": @$}
	;

Block
	: "{" StatementList "}"
		-> {"type": "block", "children": $2, "range": @$};
	;

FormalParameterList
	: IDENTIFIER
		{
			$$ = [{"type": "identifier", "identifier": $1, "range": @1}];
		}
	| FormalParameterList "," IDENTIFIER
		{
			$$ = $1.concat([{"type": "identifier", "identifier": $3, "range": @3}]);
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
		-> {"type": "call", "range": @$, "modifier": [], "children": {"self": null, "identifier": {"name": $1, "range": @1}, "params": {"children": $3, "range": @3}}};
	| THREAD IDENTIFIER "(" FunctionParameterList ")"
		-> {"type": "call", "range": @$, "modifier": ["thread"], "children": {"self": null, "identifier": {"name": $2, "range": @2}, "params": {"children": $4, "range": @4}}};
	| PointerExpression "(" FunctionParameterList ")"
		-> {"type": "call", "range": @$, "modifier": ["pointer"], "children": {"self": null, "pointer": $1, "params": {"children": $3, "range": @3}}};
	| THREAD PointerExpression "(" FunctionParameterList ")"
		-> {"type": "call", "range": @$, "modifier": ["pointer", "thread"], "children": {"self": null, "pointer": $2, "params": {"children": $4, "range": @4}}}
	| ReferenceExpression "(" FunctionParameterList ")"
		-> {"type": "call", "range": @$, "modifier": ["reference"], "children": {"self": null, "reference": $1, "params": {"children": $3, "range": @3}}};
	| THREAD ReferenceExpression "(" FunctionParameterList ")"
		-> {"type": "call", "range": @$, "modifier": ["reference", "thread"], "children": {"self": null, "reference": $2, "params": {"children": $4, "range": @4}}};
	;

FunctionExpression
	: ObjectExpression FunctionCall
		{
			$$ = $2;
			$$.children.self = $1;	
		}
	| FunctionCall
	;

PointerExpression
	: FUNC_POINTER_BEGIN ObjectExpression "]" "]"
		-> {"type": "pointer", "range": @$, "children": $2};
	| FUNC_POINTER_BEGIN ReferenceExpression "]" "]"
		-> {"type": "pointer", "range": @$, "children": $2};
	;

ReferenceExpression
	: FILEPATH "::" IDENTIFIER
		-> {"type": "reference", "range": @$, "children": {"file": {"name": $1, "range": @1}, "identifier": {"name": $3, "range": @3}}};
	| "::" IDENTIFIER
		-> {"type": "reference", "range": @$, "children": {"file": {"name": ""}, "identifier": {"name": $2, "range": @2}}};
	;

//Used Independently from Normal References
//Structure is the same as an IDENTIFIER
AnimReferenceExpression
	: "%" IDENTIFIER
		-> {"type": "reference", "name": $1+$2, "range": @$};
	;

MemberExpression
	: ObjectExpression "[" Expression "]"
		-> {"type": "array", "range": @$, "children": {"expression": $1, "member": $3}}
	| ObjectExpression "." ObjectExpression
		-> {"type": "property", "range": @$, "children": {"expression": $1, "member": $3}}
	| "[" "]"
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
		-> {"type": "list", "range": @$, "children": {"elements": $2}};
	;

ObjectExpression
	: IDENTIFIER
		-> {"type": "identifier", "name": $1, "range": @1}
	| FunctionExpression
	| MemberExpression
	| "(" ObjectExpression ")"
		{$$ = $2; $$.range = @$}
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
	| ReferenceExpression
	| ANIMTREE
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
	| e OperatorPostfix
		-> {"type": "expression", "range": @$, "children": {"left": $1, "operator": $2}};
	| OperatorPrefix e
		-> {"type": "expression", "range": @$, "children": {"operator": $1, "right": $2}};
	| e OperatorMid e
		-> {"type": "expression", "range": @$, "children": {"left": $1, "operator": $2, "right": $3}};
	| AnimReferenceExpression
	| '(' e ')'
		//-> {"type": "expression", "parentheses": true, "expression": $2}; //used for debugging
        {
			$$ = $2;
			$$.range = @$;
		}
	;

Expression
	: e
	;
	
ExpressionStatement
	: Expression ";"
		{
			$$ = $1;
			$$.range = @$;
		}
	;

ReturnStatement
	: RETURN ";"
		-> {"type": "return", "range": @$};
	| RETURN Expression ";"
		-> {"type": "return", "children": $2, "range": @$};
	;

WaitStatement
	: WAIT Expression ";"
		-> {"type": "wait", "range": @$, "children": $2};
	| WAIT "(" Expression ")" ";"
		-> {"type": "wait", "range": @$, "children": $3};
	;

EmptyStatement:
	";"
	;

IfStatement
	: IF "(" Expression ")" Statement
		-> {"type": "if", "range": @$, "children": {"expression": $3, "statement": $5}};
	| ELSE IF "(" Expression ")" Statement
		-> {"type": "elif", "range": @$, "children": {"expression": $4, "statement": $6}};
	| ELSE Statement
		-> {"type": "else", "range": @$, "children": {"statement": $2}};
	;

SwitchStatement
	: SWITCH "(" Expression ")" Statement
		-> {"type": "switch", "range": @$, "children": {"expression": $3, "statement": $5}};
	;

// TODO: 
//		Handle the statements that match a given case
CaseStatement
	: CASE LiteralExpression ":"
		-> {"type": "case", "range": @$, "children": {"expression": $2}};
	| DEFAULT ":"
		-> {"type": "default", "range": @$};
	;

LoopStatement
	: WHILE "(" Expression ")" Statement
		-> {"type": "while", "range": @$, "children": {"expression": $3, "statement": $5}};
	| FOR "(" OptionalExpression ";" OptionalExpression ";" OptionalExpression ")" Statement
		-> {"type": "for", "range": @$, "children": {"exp0": $3, "exp1": $5, "exp2": $7, "statement": $9}};
	;

Statement
	: Block
	| WaitStatement
	| ExpressionStatement
	| IfStatement
	| SwitchStatement
	| CaseStatement
	| LoopStatement
	| ReturnStatement
	| BREAK ";"
	| CONTINUE ";"
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
		{ $$ =
			{	"type": "function",
				"range": @$,
				"children": {
					"identifier": {"name": $1, "range": @1},
					"params": {"range": @3, "children": $3},
					"statements": {"range": @6, "children": $6}
				}
			};
		}
	;

SourceElement
	: IncludeDirective
	| AnimtreeDirective
	| FunctionDeclaration
	;
	
SourceElements
	: SourceElements SourceElement
		{
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
	