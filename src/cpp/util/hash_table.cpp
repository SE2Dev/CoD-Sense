#include "hash_table.h"
#include "../sys/sys_platform.h"
#include <stdlib.h>
#include <string>

int GetStrHash(const char* str)
{
	const char* s = str;
	int h = 0;
	for (int i = 0; *s != '\0'; i++)
	{
		h += (*s++) ^ (i + 55);
	}
	return h;
}

HashKey::HashKey(void)
{
	this->str = NULL;
	this->hash = 0;
}

HashKey::HashKey(const char* str)
{
	this->str = strdup(str);
	this->hash = GetStrHash(str);
}

HashKey::HashKey(const HashKey& key)
{
	this->str = strdup(key.str);
	this->hash = key.hash;
}

HashKey::~HashKey()
{
	free((void*)str);
	str = NULL;
}

int HashKey::Hash(void) const
{
	return hash;
}

const char* HashKey::Key(void) const
{
	return str;
}

HashKey& HashKey::operator=(const HashKey& k)
{
	free((void*)this->str);
	this->str = strdup(k.str);
	this->hash = k.hash;
	return *this;
}