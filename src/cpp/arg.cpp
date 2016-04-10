#include "arg.h"
#include "string.h"
#include "cvar.h"
#include "cmd.h"
#include "util/llist.h"

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
	for(Command* cmd = Command::GlobalCommands(); cmd; cmd = cmd->NextElem())
	{
		printf("  %-22s%s\n", cmd->Name(), cmd->Description());
	}
	printf("\n");
}

int Arg_ParseArgument(char*** consumable_argv, int* consumable_argc)
{
	char**& argv = *consumable_argv;
	int& argc = *consumable_argc;
	
	const char* argStr = argv[0];

	int len = strlen(argStr);
	if(!len)
	{
		fprintf(stderr, "Error: Zero length argument\n");
		return 1;
	}
	
	if(len >= 2 && (argStr[0] == '-' && argStr[1] == '-'))
	{
		printf("Full name found\n");
		return 0;
	}

	if(len == 2 && argStr[0] == '-')
	{
		CVar* cvar = (CVar*)g_shortcut[(int)argStr[1]];
		if(!cvar)
		{
			fprintf(stderr, "Error: Unrecognized argument '%s'\n", argStr);
			return 1;
		}
		
		if(cvar->Flags() & (ARG_CVAR | ARG_GLOBAL))
		{
			if(argc < 2)
			{
				fprintf(stderr, "Error: No value provided for argument '%s'\n", argStr);
				return 3;
			}
			
			cvar->AssignRawString(argv[1]);
			argc-=2;
			argv+=2;
			return 0;
		}
	}
	
	//
	// No arguments were consumed - print error & abort oncoming infinite loop
	//
	fprintf(stderr, "Error: Unrecognized argument '%s'\n", argStr);
	return 1;
}

int Arg_ParseArguments(int argc, char** argv)
{
	if(argc <= 1)
	{
		Arg_PrintUsage();
		return 1;
	}
	
	/*char** consumable_argv = &argv[1];
	for(int consumable_argc = argc - 1; consumable_argc; )
	{
		if(int err = Arg_ParseArgument(&consumable_argv, &consumable_argc))
		{
			return err;
		}
	}*/
	
	return 0;
}