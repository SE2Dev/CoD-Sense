#pragma once

#include <stdio.h>
#include <stdlib.h>
#include <iostream>

#include <string.h>

#include "gsc.tab.hpp"
#include "symbol_enum.h"
#include "location.h"

class Symbol
{
	public:
		SYMBOL_TYPE type;
	
		Symbol* parent;
		
		//Siblings
		Symbol* prev;
		Symbol* next;
		
		Range location;
	public:
	
		Symbol(void);
		Symbol(YYLTYPE loc);
		
		~Symbol();
};
