#include "string.h"

String::String(void) : value(NULL)
{
	this->type = S_TYPE_STRING;
	//printf("%s\n", SYMBOL_TYPE_STRING(type));
}

String::String(char* str)
{
	this->type = S_TYPE_STRING;
	this->value = strdup(str);
	//printf("%s value: '%s'\n", SYMBOL_TYPE_STRING(type), this->value);
}

String::String(char* str, YYLTYPE loc)
{
	this->type = S_TYPE_STRING;
	this->value = strdup(str);
	this->location = loc;
	//printf("%s value: '%s'\n", SYMBOL_TYPE_STRING(type), this->value);
	//this->location.Print();
}

String::~String()
{
	delete[] value;
}

void String::PrintInfo()
{
	printf("%s with %d children at %d(%d) - %d(%d), name '%s'\n",
		SYMBOL_TYPE_STRING(type),
		this->children ? this->children->Size() + 1 : 0,
		location.start.line,
		location.start.character,
		location.end.line,
		location.end.character,
		this->value);
}