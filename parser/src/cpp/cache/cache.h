#pragma once

#include "../symbols/symbol.h"
#include "../sys/sys_worker.h"

class ScriptCacheEntry;

struct analysis_arg_s
{
	ScriptCacheEntry* entry;
	job_func_t ast_callback;
};

class ScriptCacheEntry
{
private:
	sem_t sem_file;
	sem_t sem_ast;
	
	char* file_data;
	size_t file_size;
	
	Symbol* ast;

	void FlushAST(void); // AST is only flushed when the entry is destroyed

	//
	// Parse the contents of the stream buffer and store the result in ast
	// returns non-zero if there was an error (in which case the old AST is used)
	//
	static int ParseStreamBuffer(analysis_arg_s* arg);

public:
	ScriptCacheEntry(void);
	~ScriptCacheEntry(void);
	
	void LockAST(void);
	void LockStreamBuffer(void);
	void UnlockAST(void);
	void UnlockStreamBuffer(void);
	
	Symbol* AST(void) const;
	
	size_t UpdateStreamBuffer(size_t len, FILE* h);
	void FlushStreamBuffer(void);
	
	int PostAnalysisJob(job_func_t callback = NULL);
};

void Cache_List();
ScriptCacheEntry* Cache_Update(const char* key);
void Cache_Remove(const char* key);
void Cache_Clear();
