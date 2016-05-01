#include <stdlib.h>
#include <stdio.h>
#include <time.h>

#ifdef _WIN32
	#include <Windows.h>
#endif

#include "cmd_common.h"
#include "../cl_arg.h"
#include "../cl_cvar.h"
#include "../cl_cmd.h"

#include "../cl_watch_mode.h"

#include "../../symbols/symbol.h"
#include "../../sys/sys_platform.h"
#include "../../cache/cache.h"
#include "../../fs/fs.h"

#include <stdlib.h>

int Cmd_Symbols_ASTCallback_f(void* _arg)
{
	Symbol* ast = (Symbol*)_arg;
	for(Symbol* node = ast->Children(); node; node = node->NextElem())
	{
		node->PrintSymbol();
	} 
	return 0;
}

/*
	USAGE:	symbols [filepath]
			symbols [filepath fileSize -d fileData]
*/
int Cmd_Symbols_f(int argc, char** argv)
{
	if(argc < 2)
	{
		fprintf(stderr, "Error: Incorrect number of arguments\n");
		return 1;
	}
	
	FILE* f = NULL;
	
	ScriptCacheEntry* entry = Cache_Update(argv[1]);
	
	if(argc == 2)
	{
		long int file_size = FS_FileSize(argv[1]);
		if(file_size == -1)
		{
			fprintf(stderr, "Error: File '%s' could not be opened\n", argv[1]);
			return 1;
		}
		
		f = fopen(argv[1], "r");
		if(!f)
		{
			fprintf(stderr, "Error: File '%s' could not be opened\n", argv[1]);
			return 1;
		}
		
		entry->UpdateStreamBuffer(file_size, f);
		fclose(f);
	}
	else if( argc == 3 && CL_WatchMode_IsEnabled() )
	{
		char* end = NULL;
		long int file_size = strtol(argv[2], &end, 10);
		printf("Waiting for %ld bytes on stdin\n", file_size);
		
		entry->UpdateStreamBuffer(file_size, stdin);
	}

	entry->PostAnalysisJob(Cmd_Symbols_ASTCallback_f);
	return 0;
}

//
// PRE EXECUTION TIMER CODE (DEPRECATED)
//
/*#ifdef _WIN32
	LARGE_INTEGER freq, start;
	QueryPerformanceFrequency(&freq);
	QueryPerformanceCounter(&start);
#else //LINUX
	timespec start;
	clock_gettime(CLOCK_REALTIME, &start);
#endif*/

//
// POST EXECUTION TIMER CODE (DEPRECATED)
//		
/*
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
	
#endif*/
