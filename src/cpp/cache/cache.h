#pragma once

#include "../symbols/symbol.h"
#include "../sys/sys_semaphore.h"

class ScriptCacheEntry
{
private:
	sem_t sem_file;
	sem_t sem_ast;
	
	char* file_data;
	size_t file_size;
	
	Symbol* ast;

	void FlushAST(void); // AST is only flushed when the entry is destroyed

public:
	ScriptCacheEntry(void);
	~ScriptCacheEntry(void);
	
	void LockAST(void);
	void LockStreamBuffer(void);
	void UnlockAST(void);
	void UnlockStreamBuffer(void);
	
	Symbol* AST(void) const;
	
	//
	// Parse the contents of the stream buffer and store the result in ast
	// returns non-zero if there was an error (in which case the old AST is used)
	//
	int ParseStreamBuffer(void);
	
	size_t UpdateStreamBuffer(size_t len, FILE* h);
	void FlushStreamBuffer(void);
};

void Cache_List();
ScriptCacheEntry* Cache_Update(const char* key);
void Cache_Remove(const char* key);
void Cache_Clear();
