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

extern IArg* g_flag_verbose;
extern IArg* g_cmd_tree;

void Arg_PrintUsage(void);
