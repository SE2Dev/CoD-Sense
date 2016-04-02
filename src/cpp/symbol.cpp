#include "symbol.h"

Symbol::Symbol(void) : type(S_TYPE_NONE), prev(NULL), next(NULL), children(NULL)
{
	this->SetOwner(this);
	//printf("SYMBOL CTOR %s\n", SYMBOL_TYPE_STRING(type));
}

Symbol::Symbol(YYLTYPE loc) : type(S_TYPE_NONE), prev(NULL), next(NULL), children(NULL), location(loc)
{
	this->SetOwner(this);
	//printf("CTOR %s\n", SYMBOL_TYPE_STRING(type));
}

Symbol::~Symbol()
{
	//printf("SYMBOL DTOR\n");
}

void Symbol::AddChild(Symbol* child)
{
	if(!this->children)
		children = child;
	else
		children->AddToEnd(child);
}

void Symbol::PrintInfo()
{
	printf("%s at %d(%d) - %d(%d)\n",
		SYMBOL_TYPE_STRING(type),
		location.start.line,
		location.start.character,
		location.end.line,
		location.end.character);
}

//
// STRING
//
String::String(void) : value(NULL)
{
	this->type = S_TYPE_STRING;
	//printf("%s\n", SYMBOL_TYPE_STRING(type));
}

String::String(const char* str)
{
	this->type = S_TYPE_STRING;
	this->value = strdup(str);
	//printf("%s value: '%s'\n", SYMBOL_TYPE_STRING(type), this->value);
}

String::String(const char* str, YYLTYPE loc)
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

//
// INCLUDE
//
Include::Include(void) : file(NULL)
{
	this->type = S_TYPE_INCLUDE;
	//printf("%s\n", SYMBOL_TYPE_STRING(type));
}

Include::Include(String* filepath, YYLTYPE loc): file(filepath)
{
	this->type = S_TYPE_INCLUDE;
	this->location = loc;
	//printf("%s file: '%s'\n", SYMBOL_TYPE_STRING(type), this->file->value);
}

Include::~Include()
{
	delete[] file;
}

//
// Animtree
//
Animtree::Animtree(void) : string(NULL)
{
	this->type = S_TYPE_ANIMTREE;
	//printf("%s\n", SYMBOL_TYPE_STRING(type));
}

Animtree::Animtree(String* animtree, YYLTYPE loc): string(animtree)
{
	this->type = S_TYPE_ANIMTREE;
	this->location = loc;
	//printf("%s animtree: '%s'\n", SYMBOL_TYPE_STRING(type), this->string->value);
}

Animtree::~Animtree()
{
	delete[] string;
}