#pragma once

#include "symbol.h"
//#include "operator_enum.cpp"

class Conditional : public Symbol
{
public:
	Symbol* statement;

	Conditional(void);
	Conditional(Symbol* statement, YYLTYPE loc, SYMBOL_TYPE type);
	
	~Conditional(void);
	
	void PrintInfo(void);
};
