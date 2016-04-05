#include "expression.h"
#include "symbol.h"

Conditional::Conditional(void) : statement(NULL)
{
	this->type = S_TYPE_NONE;
}

Conditional::Conditional(Symbol* stmt, YYLTYPE loc, SYMBOL_TYPE type) : statement(stmt)
{
	this->type = type;
	this->location = loc;
	this->AddChild(stmt);
}

Conditional::~Conditional()
{
}

void Conditional::PrintInfo()
{
	printf("%s with %d children at %d(%d) - %d(%d)\n",
		SYMBOL_TYPE_STRING(type),
		this->children ? this->children->Size() + 1 : 0,
		location.start.line,
		location.start.character,
		location.end.line,
		location.end.character);
}