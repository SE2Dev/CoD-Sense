#include <stdlib.h>
#include <stdio.h>
#include <time.h>
#include "parser/gsc.tab.hpp"

#include "arg.h"

#ifdef _WIN32
	#include <Windows.h>
#endif

typedef void* yyscan_t;

extern int yylex_init(yyscan_t* ptr_yy_globals);
extern int yylex_destroy(yyscan_t yyscanner);
extern void yyset_in(FILE* in, yyscan_t scanner);
extern void yyset_out(FILE* out, yyscan_t scanner);

void yyerror(YYLTYPE* loc, yyscan_t scanner, const char* err) 
{
	fprintf(stderr, "PARSE ERROR AT LINE %d(%d): %s\n", loc->first_line, loc->first_column, err);
#if !(_DEBUG)
	exit(1);
#endif
}

int main(int argc, char** argv)
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
		
		yyscan_t scanner;
		yylex_init(&scanner);
		
		yyset_in(in, scanner);
		yyset_out(stdout, scanner);
		
		yyparse(scanner);
		yylex_destroy(scanner);
		
		if(argc > 1)
		{
#ifdef _WIN32
			LARGE_INTEGER end;
			QueryPerformanceCounter(&end);

			double diff = (double)end.QuadPart - (double)start.QuadPart;
			diff /= (double)(freq.QuadPart / 1000);

			printf("Parsed in %f ms\n", diff);
#else //LINUX
			timespec end;
			clock_gettime(CLOCK_REALTIME, &end);

			int nanos = end.tv_nsec - start.tv_nsec;
			printf("Parsed in %f ms\n", (double)nanos / 1000000.0);
#endif
			exit(0);
		}
	
#if _DEBUG
	}
#endif

	return 0;
}