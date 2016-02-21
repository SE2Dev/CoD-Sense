#/cod-sense/src/defs/ Documentation

This directory houses both the source definition files, and the compiled TypeScript file that contains all hardcoded language-specific symbol definitions that are used by this extension.

This directory can also be used as a VSCode workspace for debugging the build scripts.

`build.bat` can be run to manually generate a new `defs.ts`

----------------------
##/cod-sense/src/defs/

`/build/`
    Contains the scripts (and debug workspace) that are used to compile the definitions
>`build.js`
>	Script that is used to compile all source definition files into a single TypeScript file
>
>`template.js`
>	Serves as a template for the compiled definitions file. (All definition code is appended to a duplicate of this file)

`/raw/`
	Contains the source definition files (1 definition per file).
	**Additional definition files are placed here.**
	
`build.bat`
	Used to automatically compile the definition files into def.ts (*Can be used for manual def.ts updates*)
	
`defs.ts`
	Compiled typescript file that contains all included function definitions. **Directly used by the extension**
	
----------------------

##Definition File Structure:
`Name: funcName`
	Defines the autocomplete string that is shown in-editor
	(*This is also the string that is used when this definition is chosen*)
							
`Function: func(args)`
	Provides the declaration information for the function

`Summary: string`
	provides additional information on the function

`CallOn: string`
	Provides information on the caller when using the function

`Example: string`
	Provides an example for how the function is used

`RequiredArgs:`
	Marks the beginning of the list of *required* args
>`[arguments]` (1 per line)
	
`OptionalArgs:`
	Marks the beginning of the list of *optional* args
>`[arguments]` (1 per line)

###Argument Format:
`index : argstring: string`	*Index* defines the argument index, *argstring* is the string as seen in the function declaration, *string* provides a description that argument
