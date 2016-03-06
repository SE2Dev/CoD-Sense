var parser = require("../codscript");
var fs = require("fs");

var source = fs.readFileSync("file.gsc", 'utf8');
var ast;

try {
    ast = parser.parse(source);
    console.log(ast);
    //fs.writeFileSync("out.ast", JSON.stringify(ast), "utf8");
}
catch (exception) {
    console.log("Parse Error:  " + exception.message);
}
