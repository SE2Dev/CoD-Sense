#pragma once
#include "symbol.h"

class Reference : public Symbol
{
	public:
		String* file;
		Identifier* identifier;
		
		Reference(void);
		Reference(String* filepath, Identifier* identifier, YYLTYPE loc);
		
		~Reference(void);
		
		void PrintInfo();
};