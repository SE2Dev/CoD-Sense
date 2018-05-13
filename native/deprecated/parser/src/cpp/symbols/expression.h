#pragma once

#include "symbol.h"
//#include "operator_enum.cpp"

class Expression : public Symbol
{
private:
	OPERATOR_TYPE op_type;

public:
	Expression(void);
	Expression(YYLTYPE loc);
	Expression(OPERATOR_TYPE prefix, Expression* expr, YYLTYPE range);
	Expression(Expression* left, OPERATOR_TYPE mid_op, Expression* right, YYLTYPE range);
	Expression(Expression* expr, OPERATOR_TYPE postfix, YYLTYPE range);
	
	~Expression(void);
	
	void PrintInfo(void) const;
};
