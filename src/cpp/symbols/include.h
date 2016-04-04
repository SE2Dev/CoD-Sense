#pragma once
#include "symbol.h"

class Include : public Symbol
{
	public:
		String* file;
		
		Include(void);
		Include(String* filepath, YYLTYPE loc);
		
		~Include(void);
		
		void PrintInfo();
};
