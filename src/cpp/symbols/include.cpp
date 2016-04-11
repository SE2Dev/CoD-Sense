#include "include.h"


Include::Include(void) : file(NULL)
{
	this->type = S_TYPE_INCLUDE;
	//printf("%s\n", SYMBOL_TYPE_STRING(type));
}

Include::Include(Literal* filepath, YYLTYPE loc): file(filepath)
{
	this->type = S_TYPE_INCLUDE;
	this->location = loc;
	this->children = filepath;
	//printf("%s file: '%s'\n", SYMBOL_TYPE_STRING(type), this->file->value);
}

Include::~Include()
{
	//delete file;
	//printf("~Include()\n");
}

void Include::PrintInfo()
{
	printf("%s with %d children at %d(%d) - %d(%d), file '%s'\n",
		SYMBOL_TYPE_STRING(type),
		this->children ? this->children->Size() + 1 : 0,
		location.start.line,
		location.start.character,
		location.end.line,
		location.end.character,
		this->file->value);
}
