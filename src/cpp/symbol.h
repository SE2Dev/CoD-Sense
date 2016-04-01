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

class String : public Symbol
{
	public:
		const char* value;
		
		String(void);
		String(const char* str);
		String(const char* str, YYLTYPE loc);
		
		~String(void);
};

class Include : public Symbol
{
	public:
		String* file;
		
		Include(void);
		Include(String* filepath, YYLTYPE loc);
		
		~Include(void);
};

class Animtree : public Symbol
{
	public:
		String* string;
		
		Animtree(void);
		Animtree(String* animtree, YYLTYPE loc);
		
		~Animtree(void);
};
