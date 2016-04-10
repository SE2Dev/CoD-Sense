#pragma once
#include <stdio.h>

#define APPLICATION_NAME "parser"

enum ARG_FLAGS
{
	ARG_NULL		= 0 << 0,
	
	ARG_GLOBAL		= 1 << 0,
	
	ARG_CVAR		= 1 << 2,
	ARG_COMMAND		= 1 << 3,
};

class Argument
{
protected:
	int			flags;
	
	const char*	name;
	const char*	desc;
	char		shortcut;

	int RegisterShortcut(char shortcut);

public:
	const char*	Name(void) const;
	const char*	Description(void) const;
	int			Flags(void) const;
};

#define REGISTER_STATIC_ARGUMENT_INTERFACE(NAME) extern Argument* NAME;

REGISTER_STATIC_ARGUMENT_INTERFACE(g_cmd_tree);

#undef REGISTER_STATIC_ARGUMENT_INTERFACE

void Arg_PrintUsage(void);
int Arg_ParseArguments(int argc, char** argv);
