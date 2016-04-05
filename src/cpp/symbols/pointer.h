#pragma once
#include "symbol.h"

class Pointer : public Symbol
{
	public:
		String* file;
		Identifier* identifier;
		
		Pointer(void);
		Pointer(YYLTYPE loc);
		
		~Pointer(void);
		
		void PrintInfo();
};