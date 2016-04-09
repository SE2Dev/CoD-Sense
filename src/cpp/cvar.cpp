#include "cvar.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

CVar* g_cvar[GLOBAL_CVAR_MAX];

int g_cvar_count = 0;

//
// Used by the registration macro to register global cvars with g_cvar
//
class GCVar
{
public:
	GCVar(CVar* cvar)
	{
		g_cvar[g_cvar_count++] = cvar;
		cvar->flags |= ARG_GLOBAL;
	}
	
	~GCVar(void) { }
};

#define REGISTER_GLOBAL_CVAR(IDENTIFIER, NAME, SHORTCUT, DESCRIPTION, VALUE) CVar IDENTIFIER (NAME, SHORTCUT, DESCRIPTION, VALUE); GCVar gcv_##IDENTIFIER ( &IDENTIFIER );

REGISTER_GLOBAL_CVAR(g_verbose, "verbose", 'v', "Enables verbose logging", false);
REGISTER_GLOBAL_CVAR(dummy, "verbofse", 0, "Enables verbose logging", false);

#undef REGISTER_GLOBAL_CVAR

CVar::CVar(void)
{
	memset(this, 0, sizeof(CVar));
	this->type = CVAR_NULL;
	this->flags = ARG_CVAR;
}

CVar::CVar(const char* name, char shortcut, const char* description, int defaultValue) : int_val(defaultValue)
{
	this->type = CVAR_INT;
	this->flags = ARG_CVAR;
	
	this->name = name;
	this->desc = description;
	
	if(shortcut)
	{
		this->shortcut = 0;
		this->RegisterShortcut(shortcut);
	}
	
	this->bool_val = (int_val != 0);
	snprintf(str_val, 32, "%d", int_val);
	this->float_val = (float)int_val;
}

CVar::CVar(const char* name, char shortcut, const char* description, bool defaultValue) : bool_val(defaultValue)
{
	this->type = CVAR_BOOL;
	this->flags = ARG_CVAR;
	
	this->name = name;
	this->desc = description;
	
	if(shortcut)
	{
		this->shortcut = 0;
		this->RegisterShortcut(shortcut);
	}
	
	this->int_val = bool_val ? 1 : 0;
	snprintf(str_val, 32, "%s", bool_val ? "true" : "false");
	this->float_val = (float)int_val;
}

CVar::CVar(const char* name, char shortcut, const char* description, float defaultValue) : float_val(defaultValue)
{
	this->type = CVAR_FLOAT;
	this->flags = ARG_CVAR;
	
	this->name = name;
	this->desc = description;
	
	if(shortcut)
	{
		this->shortcut = 0;
		this->RegisterShortcut(shortcut);
	}
	
	this->int_val = (int)float_val;
	this->bool_val = (int_val != 0);
	snprintf(str_val, 32, "%f", float_val);
}

CVar::CVar(const char* name, char shortcut, const char* description, const char* defaultValue)
{
	this->type = CVAR_STRING;
	this->flags = ARG_CVAR;
	
	this->name = name;
	this->desc = description;
	
	if(shortcut)
	{
		this->shortcut = 0;
		this->RegisterShortcut(shortcut);
	}
	
	strncpy(this->str_val, defaultValue, 31);
	this->str_val[31] = '\0';
	
	this->bool_val = (str_val[0] != 0);
	this->int_val = bool_val ? 1 : 0;
	this->float_val = (float)this->int_val;
}


CVar::~CVar(void)
{
}


int	CVar::ValueInt(void) const
{
	return this->int_val;
}

bool CVar::ValueBool(void) const
{
	return this->bool_val;
}

float CVar::ValueFloat(void) const
{
	return this->float_val;
}

const char*	CVar::ValueString(void) const
{
	return this->str_val;
}
