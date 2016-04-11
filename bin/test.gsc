#include maps\_utility;

#using_animtree("human");

/*
	don�t stop for unicode shenanigans
*/

debug()
{
	self thread callme(arg);	//this line leaks
	 							// Issue caused by Call::SetCaller
}

main(arg1, arg2, arg3, arg4, arg5, arg6)
{
	"a_statement";

     myvar = 42;
	 
	// ++prefixme;
	 
	 1+2;
	 a=1+2*4;
	 
	 myfunc = ::me;
	 maps\file::func;
	 
	 idfunc();
	 thread threadfunc();
	 [[ref]]();
	 
	 return 67;
}

myfunc(aaaa, bb , ccCC_c)
{
	"do_something";
	make_a_statement;
	
	if(1>3)
	{
		do_this;
		and_this;
	}
	else
	{
		THISSSSSSS;
	}
	(a)=4;
	((((((A))))));
	wait 1.0;
	wait (a+b);
}