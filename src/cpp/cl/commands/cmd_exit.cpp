#include "cmd_common.h"
#include "../cl_watch_mode.h"

int Cmd_Exit_f(int argc, char** argv)
{
	CL_WatchMode_Disable();
	return 0;
}
