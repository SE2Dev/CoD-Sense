#include "cmd.h"
#include <stdio.h>

#define REGISTER_GLOBAL_COMMAND(IDENTIFIER, NAME, DESCRIPTION) Command IDENTIFIER(NAME, DESCRIPTION);

Command* Command::g_cmds = NULL;
REGISTER_GLOBAL_COMMAND(g_cmd_help, "help", "Print usage information");
REGISTER_GLOBAL_COMMAND(g_cmd_tree, "tree", "Print the AST for a given script file");

#undef REGISTER_GLOBAL_COMMAND

Command::Command(const char* name, const char* description)
{
	this->SetOwner(this);
	
	if(!Command::g_cmds)
	{
		g_cmds = this;
	}
	else
	{
		g_cmds->AddToEnd(this);
	}
	
	this->name = name;
	this->desc = description;
	this->flags = ARG_COMMAND;
}

Command* Command::GlobalCommands(void)
{
	return Command::g_cmds;
}