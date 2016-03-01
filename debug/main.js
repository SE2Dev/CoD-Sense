var parser = require("../codscript");
var fs = require("fs");

var source = fs.readFileSync("file.gsc", 'utf8');
var ast;

try {
    ast = parser.parse(source);
    console.log(ast);
}
catch (exception) {
    console.log("Parse Error:  " + exception.message);
}
