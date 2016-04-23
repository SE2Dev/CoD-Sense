#include <stdlib.h>
#include <stdio.h>
#include <time.h>

#ifdef _WIN32
	#include <Windows.h>
#endif

#include "parser/gsc.tab.hpp"
#include "platform.h"
#include "arg.h"
#include "cvar.h"
#include "cmd.h"

int main(int argc, char** argv)
{
	if(argc <= 1)
	{
		Arg_PrintUsage();
		return 1;
	}
	
	ArgParsedInfo cmd_info;
	if(int err = Arg_ParseArguments(argc - 1, argv + 1, &cmd_info))
	{
		fprintf(stderr, "Fatal Error: %d\n", err);
		return err;
	}

	return cmd_info.Cmd()->Exec(cmd_info.Argc(), cmd_info.Argv());
}