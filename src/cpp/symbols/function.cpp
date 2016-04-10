#include "function.h"

Function::Function(void) : identifier(NULL)
{
	this->type = S_TYPE_FUNCTION_DECL;
}

Function::Function(Identifier* identifier, YYLTYPE loc)
{
	this->type = S_TYPE_FUNCTION_DECL;
	
	this->identifier = identifier;
	this->location = loc;
	
	this->AddChild(identifier);
}

Function::~Function()
{
	//delete this->identifier;
	printf("~Function()\n");
}

void Function::PrintInfo()
{
	printf("%s with %d children at %d(%d) - %d(%d), name '%s'\n",
		SYMBOL_TYPE_STRING(type),
		this->children ? this->children->Size() + 1 : 0,
		location.start.line,
		location.start.character,
		location.end.line,
		location.end.character,
		this->identifier->value);
}




Call::Call(void) : flags(CALL_FLAG_NULL), identifier(NULL), caller(NULL)
{
	this->type = S_TYPE_FUNCTION_CALL;
}

Call::Call(YYLTYPE loc, int flags) : flags(flags), identifier(NULL), caller(NULL)
{
	this->type = S_TYPE_FUNCTION_CALL;
	this->location = loc;
}

Call::~Call()
{
	//delete this->identifier;
	printf("~Call()\n");
}

void Call::SetCaller(Expression* caller)
{
	if(this->flags & CALL_FLAGS_EXPLICIT_CALLER)
		return;

	this->caller = caller;
	if(caller)
	{
		// Swap the head of the children list with the caller, insert the old list after that
		Symbol* children = this->children;
		this->children = caller;
		caller->AddToEnd(children);
	}
	this->flags |= CALL_FLAGS_EXPLICIT_CALLER;
}

void Call::PrintInfo()
{
	printf("%s with %d children at %d(%d) - %d(%d), flags 0x%X\n",
		SYMBOL_TYPE_STRING(type),
		this->children ? this->children->Size() + 1 : 0,
		location.start.line,
		location.start.character,
		location.end.line,
		location.end.character,
		this->flags);
}