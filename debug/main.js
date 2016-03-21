var parser = require("../out/codscript");
var fs = require("fs");

var source = fs.readFileSync("file.gsc", 'utf8');
var ast;

try {
    var startTime = new Date().getTime();
    ast = parser.parse(source);
    var endTime = new Date().getTime();
    console.log(ast);
    console.log(`PARSED: In ${endTime - startTime} ms`);
    //fs.writeFileSync("out.ast", JSON.stringify(ast), "utf8");
}
catch (exception) {
    console.error("Parse Error:  " + exception.message);
}
