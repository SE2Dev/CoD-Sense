#include <stdlib.h>
#include <stdio.h>
#include <time.h>

#ifdef _WIN32
	#include <Windows.h>
#endif

#include "../../parser/gsc.tab.hpp"
#include "../../parser/gsc.yy.h"
#include "../../sys/sys_platform.h"
#include "../cl_arg.h"
#include "../cl_cvar.h"
#include "../cl_cmd.h"

#include "../../symbols/symbol.h"

#include "cmd_common.h"

int Cmd_Tree_f(int argc, char** argv)
{
	FILE* in = argc > 1 ? fopen(argv[1], "r") : stdin;
	if(!in)
	{
		fprintf(stderr, "Error: File %s could not be opened\n", argv[1]);
		return 1;
	}

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
	//yyset_debug(1, scanner);
	yyset_out(stderr, scanner);
	
	Symbol* AST = NULL;
	int result = yyparse(&AST, scanner);
	yylex_destroy(scanner);
	printf("PARSE RESULT %d\n", result);
	
	if(argc > 1)
	{
		fclose(in);
	}
	
	if(result)
	{
		return result;
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

	timespec delta;
	if(end.tv_nsec - start.tv_nsec < 0)
	{
		delta.tv_sec = end.tv_sec - start.tv_sec - 1;
		delta.tv_nsec = 1000000000 + end.tv_nsec - start.tv_nsec;
	}
	else
	{
		delta.tv_sec = end.tv_sec - start.tv_sec;
		delta.tv_nsec = end.tv_nsec - start.tv_nsec;
	}
	
	elapsed_time_ms = 1000.0 * (double)delta.tv_sec;
	elapsed_time_ms += (double)delta.tv_nsec / 1000000.0;
	
#endif
	
	AST->PrintInfoRecursive();
	
	delete AST;
		
	if(argc > 1)
	{
		printf("Parsed in %f ms\n", elapsed_time_ms);
	}
	
	return 0;
}