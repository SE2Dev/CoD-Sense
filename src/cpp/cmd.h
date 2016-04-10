#pragma once
#include "arg.h"
#include "util/llist.h"

class Command : public Argument, public LList<Command>
{
private:
	static Command* g_cmds;
	
public:

	Command(const char* name, const char* description);
	
	static Command* GlobalCommands(void);
};

#define REGISTER_GLOBAL_COMMAND(IDENTIFIER) extern Command IDENTIFIER;

REGISTER_GLOBAL_COMMAND(g_cmd_help);
REGISTER_GLOBAL_COMMAND(g_cmd_tree);

#undef REGISTER_GLOBAL_COMMAND
