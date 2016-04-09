#include "arg.h"
#include "string.h"

Argument* g_shortcut[255] = {NULL};

int Argument::RegisterShortcut(char shortcut)
{
	if(this->shortcut)
	{
		fprintf(stderr, "Error: Could not register shortcut '-%c' for argument '%s' - arg already has shortcut '-%c'\n", shortcut, this->name, this->shortcut);
		return 3;
	}
	
	if(shortcut)
	{
		if(!g_shortcut[(int)shortcut])
		{
			this->shortcut = shortcut;
			g_shortcut[(int)shortcut] = this;
			return 0;
		}
		else
		{
			fprintf(stderr, "Error: Could not initialize argument '%s' - shortcut '-%c' already exists for another argument\n", name, shortcut);
			return 1;
		}
	}
	
	fprintf(stderr, "Error: Could not register shortcut'-%c' for argument '%s'\n", shortcut, this->name);
	return 2;
}

const char*  Argument::Name(void) const
{
	return this->name;
}

const char*  Argument::Description(void) const
{
	return this->desc;
}

int  Argument::Flags(void) const
{
	return this->flags;
}

class Command : public Argument
{
private:
public:
	Command(const char* name, const char shortcut, const char* description)
	{
		this->name = name;
		this->desc = description;
		this->flags = ARG_COMMAND;
		
		if(shortcut)
			this->RegisterShortcut(shortcut);
	}
};


//
// DO NOT USE DIRECTLY
//
// REGISTER_STATIC_ARGUMENT(Option, g_verbose, "verbose", 'v', "Enable verbose logging");
// expands to:
// 	static Option l_g_verbose("verbose", 'v', "Enable verbose logging");
// 	Argument* g_verbose = &l_g_verbose;
//
#define REGISTER_STATIC_ARGUMENT(TYPE,NAME,ARG_NAME,ARG_SHORTCUT,ARG_DESC) TYPE l_##NAME (ARG_NAME, ARG_SHORTCUT, ARG_DESC); Argument* NAME = &l_##NAME;

//
// Registration macros used for automatically registering an argument of a specific flags
//
#define REGISTER_STATIC_COMMAND(NAME,ARG_NAME,ARG_SHORTCUT,ARG_DESC) REGISTER_STATIC_ARGUMENT(Command, NAME, ARG_NAME, ARG_SHORTCUT, ARG_DESC)

//
// ARGUMENTS
//
REGISTER_STATIC_COMMAND( g_cmd_tree, "tree", 't', "Print the AST for a given script file");

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
		if(g_shortcut[i] && g_shortcut[i]->Flags() & (ARG_GLOBAL | ARG_CVAR))
		{
			printf("  -%c, --%-22s%s\n", i, g_shortcut[i]->Name(), g_shortcut[i]->Description());
		}
	}
	printf("\n");
	
	printf("Commands:\n");
	for(int i = 0; i < 255; i++)
	{
		if(g_shortcut[i] && g_shortcut[i]->Flags() & ARG_COMMAND)
		{
			printf("  -%c, --%-22s%s\n", i, g_shortcut[i]->Name(), g_shortcut[i]->Description());
		}
	}
	printf("\n");
}

int Arg_ParseArgument(char* arg)
{
	int len = strlen(arg);
	if(!len)
	{
		fprintf(stderr, "Error: Zero length argument\n");
		return 1;
	}
	
	if(len >= 2 && (arg[0] == '-' && arg[1] == '-'))
	{
		printf("Full name found\n");
		return 0;
	}

	if(len == 2 && arg[0] == '-')
	{
		printf("Shortcut found %d\n", g_shortcut[(int)arg[1]] != 0);
		return 0;
	}
	
	fprintf(stderr, "Error: Unrecognized argument '%s'\n", arg);
	return 1;
}

int Arg_ParseArguments(int argc, char** argv)
{
	if(argc <= 1)
	{
		Arg_PrintUsage();
		return 1;
	}
	
	for(int i = 1; i < argc; i++)
	{
		Arg_ParseArgument(argv[i]);
	}
	
	return 0;
}