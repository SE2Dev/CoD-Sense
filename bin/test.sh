#!/bin/bash
#./bin/parser tree ./bin/test.gsc
valgrind --leak-check=full --show-leak-kinds=all ./bin/parser tree ./bin/test.gsc
read -p "Press [Enter] to Exit..."