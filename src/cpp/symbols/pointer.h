#pragma once
#include "symbol.h"

class Pointer : public Symbol
{
	public:
		String* file;
		Identifier* identifier;
		
		Pointer(void);
		Pointer(String* filepath, Identifier* identifier, YYLTYPE loc);
		
		~Pointer(void);
		
		void PrintInfo();
};