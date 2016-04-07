#include <stdlib.h>
#include <stdio.h>
#include <time.h>
#include "parser/gsc.tab.hpp"

typedef void* yyscan_t;

extern int yylex_init(yyscan_t* ptr_yy_globals);
extern int yylex_destroy(yyscan_t yyscanner);
extern void yyset_in(FILE* in, yyscan_t scanner);
extern void yyset_out(FILE* out, yyscan_t scanner);

#define DEBUG 1

void yyerror(YYLTYPE* loc, yyscan_t scanner, const char* err) {
	fprintf(stderr, "PARSE ERROR AT LINE %d(%d): %s\n",
		loc->first_line, loc->first_column,
		err);
		
#if !(DEBUG)
	exit(1);
#endif
}

int main(int argc, char** argv) {
	FILE* in = argc > 1 ? fopen(argv[1], "r") : stdin;
	
#if DEBUG
	while(1)
	{
#endif

		timespec start;
		clock_gettime(CLOCK_REALTIME, &start);
		
		yyscan_t scanner;
		yylex_init(&scanner);
		
		yyset_in(in, scanner);
		yyset_out(stdout, scanner);
		
		yyparse(scanner);
		yylex_destroy(scanner);
		
		timespec end;
		clock_gettime(CLOCK_REALTIME, &end);
		
		if(argc > 1)
		{
			int nanos = end.tv_nsec - start.tv_nsec;
			printf("Parsed in %f ms\n", (double)nanos / 1000000.0);
			exit(0);
		}
	
#if DEBUG
	}
#endif

	return 0;
}