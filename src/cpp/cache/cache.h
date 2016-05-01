#pragma once

#include "../symbols/symbol.h"

class ScriptCacheEntry
{
private:
	char* file_data;
	size_t file_size;
	
	Symbol* ast;

	void FlushAST(void); // AST is only flushed when the entry is destroyed

public:
	ScriptCacheEntry(void);
	~ScriptCacheEntry(void);
	
	size_t UpdateFile(size_t len, FILE* h);
	void UpdateAST(void);
	
	void FlushFile(void);
};

void Cache_List();
ScriptCacheEntry* Cache_Update(const char* key);
void Cache_Remove(const char* key);
void Cache_Clear();
