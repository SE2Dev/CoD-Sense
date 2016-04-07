#pragma once

#include "symbol.h"
//#include "operator_enum.cpp"

class Conditional : public Symbol
{
public:
	Expression* expression;
	Symbol* statement;

	Conditional(void);
	Conditional(Expression* expr, Symbol* stmt, YYLTYPE loc, SYMBOL_TYPE type);
	
	~Conditional(void);
	
	void PrintInfo(void);
};
