SRC_DIRS=src/cpp
SRC_PATTERN=\( -name "*.c" -o -name "*.cpp" \)

PARSER_SRC="src/gsc.ypp"
LEXER_SRC="src/gsc.l"

PARSER_SRC_OUT="src/cpp/parser/gsc.tab"
LEXER_SRC_OUT="src/cpp/parser/gsc.yy"

default:
	@$(MAKE) clean
	@$(MAKE) parser
	@$(MAKE) compile
	@$(MAKE) link

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
	
link:
	@g++ -Wall -g -o bin/parser obj/*.o

test:
	make
	gnome-terminal -x ./bin/parser

test-file:
	make
	gnome-terminal -x ./bin/test.sh
