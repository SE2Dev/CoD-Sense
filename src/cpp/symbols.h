#include <stdio.h>
#include <stdlib.h>
#include <iostream>

#include <string.h>

#include "gsc.tab.hpp"

class Symbol
{
	public:
		Symbol* parent;
		
		//Siblings
		Symbol* prev;
		Symbol* next;
		
		YYLTYPE location;
	public:
	
		Symbol(void) : prev(NULL), next(NULL)
		{
			this->location.first_line = this->location.last_line = 0;
			this->location.first_column = this->location.last_column = 0;
		}
		
		Symbol(char* str, YYLTYPE loc) : prev(NULL), next(NULL), location(loc)
		{
		}
		
		~Symbol()
		{
			printf("DTOR\n");
		}
};
