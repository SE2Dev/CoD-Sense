#pragma once
#include "symbol.h"

class String : public Symbol
{
	public:
		const char* value;
		
		String(void);
		String(char* str);
		String(char* str, YYLTYPE loc);
		
		virtual ~String(void);
		
		void PrintInfo();
};