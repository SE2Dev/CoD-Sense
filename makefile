SRC_DIRS=src/cpp
SRC_PATTERN=\( -name "*.c" -o -name "*.cpp" \)

PARSER_SRC="src/gsc.ypp"
LEXER_SRC="src/gsc.l"

PARSER_SRC_OUT="src/cpp/parser/gsc.tab"
LEXER_SRC_OUT="src/cpp/parser/gsc.yy"

MAKE_CHILD_OPTIONS=--no-print-directory

default:
	@$(MAKE) ${MAKE_CHILD_OPTIONS} clean
	@$(MAKE) ${MAKE_CHILD_OPTIONS} parser
	@$(MAKE) ${MAKE_CHILD_OPTIONS} compile || $(MAKE) ${MAKE_CHILD_OPTIONS} compile-error #runs compile-error if compile fails
	@$(MAKE) ${MAKE_CHILD_OPTIONS} link

clean:
	@mkdir -p bin
	@mkdir -p obj/ && rm -f -r obj/*
	@mkdir -p src/cpp/parser && rm -f -r src/cpp/parser/*

parser:
	@bison -v -o ${PARSER_SRC_OUT}".cpp" -d ${PARSER_SRC}
	@flex -o ${LEXER_SRC_OUT}".cpp" -d ${LEXER_SRC}

compile:
	@g++ -Wall -g -c `find $(SRC_DIRS) -type f $(SRC_PATTERN) -print`
	@mv *.o obj/

compile-error:
	@rm -f -r *.o
	@exit 1
	
link:
	@g++ -Wall -g -o bin/parser obj/*.o

test:
	@$(MAKE)
	@gnome-terminal -x ./bin/parser

test-file:
	@$(MAKE)
	@gnome-terminal -x ./bin/test.sh
