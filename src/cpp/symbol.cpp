#include "symbol.h"

Symbol::Symbol(void) : type(S_TYPE_NONE), prev(NULL), next(NULL) { }

Symbol::Symbol(YYLTYPE loc) : type(S_TYPE_NONE), prev(NULL), next(NULL), location(loc)
{
	printf("CTOR %s\n", SYMBOL_TYPE_STRING(type));
}

Symbol::~Symbol()
{
	printf("DTOR\n");
}