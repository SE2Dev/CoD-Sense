#include "pointer.h"

Pointer::Pointer(void) : file(NULL), identifier(NULL)
{
	this->type = S_TYPE_POINTER;
}

Pointer::Pointer(YYLTYPE loc)
{
	this->type = S_TYPE_POINTER;
	
	this->location = loc;
}

Pointer::~Pointer()
{
	delete this->file;
	delete this->identifier;
}

void Pointer::PrintInfo()
{
	printf("%s with %d children at %d(%d) - %d(%d), file '%s', func '%s'\n",
		SYMBOL_TYPE_STRING(type),
		this->children ? this->children->Size() + 1 : 0,
		location.start.line,
		location.start.character,
		location.end.line,
		location.end.character,
		(this->file) ? this->file->value : "$this",
		"this->identifier->value");
}