default:
	mkdir -p bin
	mkdir -p out && rm -f out/*
	bison -d src/gsc.ypp
	flex src/gsc.l
	mv -f -t out/ *.cpp *.c *.hpp *.h 2>/dev/null; true
	cd out
	g++ -g -o bin/parser out/*

test:
	make
	gnome-terminal -x ./bin/parser

test-file:
	make
	gnome-terminal -x ./bin/parser ./bin/test.gsc
	