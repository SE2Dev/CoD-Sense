#include "cache.h"
#include "../util/hash_table.h"
#include "../parser/gsc.yy.h"
#include <iostream>

HashTable<ScriptCacheEntry> script_cache;

ScriptCacheEntry* Cache_Update(const char* key)
{
	return script_cache.Add(key);
}

void Cache_Remove(const char* key)
{
	script_cache.RemoveNode(key);
}

void Cache_Clear()
{
	script_cache.Clear();
}

void Cache_List_Callback_f(int index, const char* key, void* value)
{
	ScriptCacheEntry* entry = (ScriptCacheEntry*)value;
	printf("[%d] %s\n", index, key);
}

void Cache_List()
{
	int elemCount = script_cache.Traverse(Cache_List_Callback_f);
	printf("%d elements in cache\n", elemCount);
}

ScriptCacheEntry::ScriptCacheEntry(void) : file_data(NULL), file_size(0), ast(NULL)
{
	
}

ScriptCacheEntry::~ScriptCacheEntry(void)
{
	FlushFile();
	FlushAST();
}

size_t ScriptCacheEntry::UpdateFile(size_t len, FILE* h)
{
	delete[] file_data;
	file_size = len;
	file_data = new char[file_size];
	
	return fread(file_data, 1, file_size, h);
}

void ScriptCacheEntry::UpdateAST()
{
	if(file_data == NULL)
	{
		return;
	}
	
	yyscan_t scanner = NULL;
	yylex_init(&scanner);
	
	yy_scan_bytes(file_data, file_size, scanner);
	
	Symbol* AST = NULL;
	int result = yyparse(&AST, scanner);
	yylex_destroy(scanner);
	
	//
	// If the new file cannot be parsed
	// the old AST is reused
	//
	if(result != 0)
	{
		return;
	}
	
	//
	// Otherwise use the new one
	//
	Symbol* oldAST = this->ast;
	this->ast = AST;
	delete oldAST;
}

void ScriptCacheEntry::FlushFile()
{
	file_size = 0;
	delete[] file_data;
	file_data = NULL;
}

void ScriptCacheEntry::FlushAST()
{
	delete[] ast;
	ast = NULL;
}