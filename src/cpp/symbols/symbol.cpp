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
	/*printf("~%s with %d children at %d(%d) - %d(%d)\n",
		SYMBOL_TYPE_STRING(type),
		this->children ? this->children->Size() + 1 : 0,
		location.start.line,
		location.start.character,
		location.end.line,
		location.end.character);*/
	
	delete this->children;
	this->children = NULL;
	delete this->NextElem();
	this->next = NULL;
}

void Symbol::AddChild(Symbol* child)
{
	if(!this->children)
		children = child;
	else
		children->AddToEnd(child);
}

void Symbol::FreeChildren(void)
{
	for(Symbol* s = this->children; s; s = s->NextElem())
	{
		s->FreeChildren();
	}
	
	delete this->children;
	this->children = NULL;
}

void Symbol::PrintInfo()
{
	printf("%s with %d children at %d(%d) - %d(%d)\n",
		SYMBOL_TYPE_STRING(type),
		this->children ? this->children->Size() + 1 : 0,
		location.start.line,
		location.start.character,
		location.end.line,
		location.end.character);
}

void Symbol::PrintInfoRecursive(int indentLevel)
{
	this->PrintInfo();
	
	for(Symbol* c = this->children; c; c = c->NextElem())
	{
		for(int i = 0; i < indentLevel; i++)
		{
			printf("│   ");
		}
		printf("%s", c->NextElem() ? "├── " : "└── ");
		c->PrintInfoRecursive(indentLevel + 1);
	}
}

void Symbol::_debug_override_type(SYMBOL_TYPE type)
{
	this->type = type;
}
