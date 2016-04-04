#pragma once
#include "symbol.h"

class Identifier : public Symbol
{
	public:
		const char* value;
		
		Identifier(void);
		Identifier(char* str);
		Identifier(char* str, YYLTYPE loc);
		
		virtual ~Identifier(void);
		
		void PrintInfo();
};