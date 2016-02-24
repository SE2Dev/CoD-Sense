'use strict'

/*
    TODO:
        Find a better / safer way to locate the tmLanguage file
*/

import {console} from '../server';
import {BuiltInModule, extensionPath, StripDirectory} from '../util/path';

var Registry = require(BuiltInModule("vscode-textmate")).Registry;
var registry = new Registry();
var grammar = registry.loadGrammarFromPathSync(extensionPath + "syntaxes/gsc.tmLanguage");

var Global = {
    tokenizeLine: grammar.tokenizeLine
};
module.exports = grammar;