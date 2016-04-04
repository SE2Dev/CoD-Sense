#pragma once
#include "symbol.h"

class Animtree : public Symbol
{
	public:
		String* string;
		
		Animtree(void);
		Animtree(String* animtree, YYLTYPE loc);
		
		~Animtree(void);
		
		void PrintInfo();
};
