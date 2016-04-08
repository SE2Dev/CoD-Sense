#include "arg.h"

IArg* g_shortcut[255] = {NULL};

class Arg : public IArg
{
protected:
	const char*	name;
	const char*	desc;
	char	shortcut;
	
	ARG_TYPE type;
	
	bool enabled;

	int RegisterShortcut(char shortcut)
	{
		if(this->shortcut)
		{
			if(!g_shortcut[(int)this->shortcut])
			{
				g_shortcut[(int)this->shortcut] = this;
				return 0;
			}
			else
			{
				return 1;
				fprintf(stderr, "Error: Could not initialize argument '%s' - shortcut '-%c' already exists\n", name, shortcut);
			}
		}
		
		return 2;
	}

public:
	const char* Name(void) const
	{
		return this->name;
	}
	
	const char* Description(void) const
	{
		return this->desc;
	}
	
	ARG_TYPE Type(void) const
	{
		return this->type;
	}
};

class Option : public Arg
{
private:
public:
	Option(const char* name, const char shortcut, const char* description)
	{
		this->name = name;
		this->desc = description;
		this->shortcut = shortcut;
		this->type = ARG_OPTION;
		
		if(this->shortcut)
			this->RegisterShortcut(shortcut);
	}
};

class Command : public Arg
{
private:
public:
	Command(const char* name, const char shortcut, const char* description)
	{
		this->name = name;
		this->desc = description;
		this->shortcut = shortcut;
		this->type = ARG_COMMAND;
		
		if(this->shortcut)
			this->RegisterShortcut(shortcut);
	}
};

//
// DO NOT USE DIRECTLY
//
// REGISTER_STATIC_ARGUMENT(Option, verbose, "verbose", 'v', "Enable verbose logging");
// expands to:
// 	static Option l_flag_verbose("verbose", 'v', "Enable verbose logging");
// 	IArg* g_flag_verbose = &l_flag_verbose;
//
#define REGISTER_STATIC_ARGUMENT(TYPE,NAME,ARG_NAME,ARG_SHORTCUT,ARG_DESC) TYPE l_##NAME (ARG_NAME, ARG_SHORTCUT, ARG_DESC); IArg* g_##NAME = &l_##NAME;

//
// Registration macros used for automatically registering an argument of a specific type
//
#define REGISTER_STATIC_OPTION(NAME,ARG_NAME,ARG_SHORTCUT,ARG_DESC) REGISTER_STATIC_ARGUMENT(Option, NAME, ARG_NAME, ARG_SHORTCUT, ARG_DESC)
#define REGISTER_STATIC_COMMAND(NAME,ARG_NAME,ARG_SHORTCUT,ARG_DESC) REGISTER_STATIC_ARGUMENT(Command, NAME, ARG_NAME, ARG_SHORTCUT, ARG_DESC)

//
// ARGUMENTS
//
REGISTER_STATIC_OPTION( verbose, "verbose", 'v', "Enable verbose logging");
REGISTER_STATIC_COMMAND( tree, "tree", 't', "Print the AST for a given script file");

#undef REGISTER_STATIC_ARGUMENT
#undef REGISTER_STATIC_OPTION
#undef REGISTER_STATIC_COMMAND

void Arg_PrintUsage(void)
{
	printf(	"%-9s%s\n%-9s%s\n\n",
			"Usage:",	APPLICATION_NAME" [options] [command] [arguments]",
			"Example:",	APPLICATION_NAME" --tree -f 'maps/utility.gsc'");
	
	printf("Options:\n");
	for(int i = 0; i < 255; i++)
	{
		if(g_shortcut[i] && g_shortcut[i]->Type() == ARG_OPTION)
		{
			printf("  -%c, --%-22s%s\n", i, g_shortcut[i]->Name(), g_shortcut[i]->Description());
		}
	}
	printf("\n");
	
	printf("Commands:\n");
	for(int i = 0; i < 255; i++)
	{
		if(g_shortcut[i] && g_shortcut[i]->Type() == ARG_COMMAND)
		{
			printf("  -%c, --%-22s%s\n", i, g_shortcut[i]->Name(), g_shortcut[i]->Description());
		}
	}
	printf("\n");
}

