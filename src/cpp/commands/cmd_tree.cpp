#include <stdlib.h>
#include <stdio.h>
#include <time.h>

#ifdef _WIN32
	#include <Windows.h>
#endif

#include "../parser/gsc.tab.hpp"
#include "../platform.h"
#include "../arg.h"
#include "../cvar.h"
#include "../cmd.h"

#include "../symbols/symbol.h"

typedef void* yyscan_t;

extern int yylex_init(yyscan_t* ptr_yy_globals);
extern int yylex_destroy(yyscan_t yyscanner);
extern void yyset_in(FILE* in, yyscan_t scanner);
extern void yyset_out(FILE* out, yyscan_t scanner);

void yyerror(YYLTYPE* loc, Symbol** AST, yyscan_t scanner, const char* err) 
{
	fprintf(stderr, "PARSE ERROR AT LINE %d(%d): %s\n", loc->first_line, loc->first_column, err);
#if !(_DEBUG)
	exit(1);
#endif
}

int Cmd_Tree_f(int argc, char** argv)
{
		FILE* in = argc > 1 ? fopen(argv[1], "r") : stdin;
	
#if _DEBUG
	while(1)
	{
#endif

#ifdef _WIN32
		LARGE_INTEGER freq, start;
		QueryPerformanceFrequency(&freq);
		QueryPerformanceCounter(&start);
#else //LINUX
		timespec start;
		clock_gettime(CLOCK_REALTIME, &start);
#endif
		
		yyscan_t scanner = NULL;
		yylex_init(&scanner);
		
		yyset_in(in, scanner);
		yyset_out(stdout, scanner);
		
		Symbol* AST = NULL;
		yyparse(&AST, scanner);
		yylex_destroy(scanner);
		
		for(Symbol* symbol = AST; symbol; symbol = symbol->NextElem())
		{
			symbol->PrintInfoRecursive();
		}
		
		double elapsed_time_ms = 0.0;
#ifdef _WIN32
		LARGE_INTEGER end;
		QueryPerformanceCounter(&end);

		elapsed_time_ms = (double)end.QuadPart - (double)start.QuadPart;
		elapsed_time_ms /= (double)(freq.QuadPart / 1000);
#else //LINUX
		timespec end;
		clock_gettime(CLOCK_REALTIME, &end);

		int nanos = end.tv_nsec - start.tv_nsec;
		elapsed_time_ms = (double)nanos / 1000000.0;
#endif
		
		if(argc > 1)
		{
			printf("Parsed in %f ms\n", elapsed_time_ms);
			exit(0);
		}
	
#if _DEBUG
	}
#endif
}