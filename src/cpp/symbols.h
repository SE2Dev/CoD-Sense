#include <stdio.h>
#include <stdlib.h>
#include <iostream>

#include <string.h>

#include "gsc.tab.hpp"
#include "location.h"

class Symbol
{
	public:
		Symbol* parent;
		
		//Siblings
		Symbol* prev;
		Symbol* next;
		
		Range location;
	public:
	
		Symbol(void) : prev(NULL), next(NULL) { }
		
		Symbol(YYLTYPE loc) : prev(NULL), next(NULL), location(loc)
		{
			printf("CTOR\n");
		}
		
		~Symbol()
		{
			printf("DTOR\n");
		}
};
