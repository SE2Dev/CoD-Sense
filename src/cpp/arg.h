#pragma once
#include <stdio.h>

#define APPLICATION_NAME "parser"

enum ARG_TYPE
{
	ARG_OPTION,
	ARG_COMMAND,
	
	ARG_ABSTRACT,
};

class IArg
{
public:
	virtual const char*	Name(void) const = 0;
	virtual const char*	Description(void) const = 0;
	virtual ARG_TYPE	Type(void) const = 0;
};

#define REGISTER_STATIC_ARGUMENT_INTERFACE(NAME) extern IArg* g_##NAME;

REGISTER_STATIC_ARGUMENT_INTERFACE(verbose);	//g_verbose
REGISTER_STATIC_ARGUMENT_INTERFACE(tree);		//g_tree

#undef REGISTER_STATIC_ARGUMENT_INTERFACE

void Arg_PrintUsage(void);
