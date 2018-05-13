/* global process */
"use strict";

var fs = require("fs");

var outfile = "defs.ts";

var rxScriptArgument = new RegExp("^--(\\w*)$", "g");

var rxAttribute = new RegExp("\n[^\\s+]\\w*[^\\s+]:");
var rxAttributeArgument = new RegExp("(\\d+)\\s*:\\s*(.*)", "g");

var rxEndl = new RegExp("\\r\\n?|\\n", "g");
var rxQuotes = new RegExp("\"", "g");

var rxPath = new RegExp(".*(\\/|\\\\)");

function ExtractProcessArgument(key) {
    for (var i = 2; i < process.argv.length; i++) {
        if (!rxScriptArgument.test(process.argv[i]))
            continue;

        var argName = process.argv[i].match(rxScriptArgument)[0];
        if (argName != "--" + key)
            continue;

        if (i + 1 >= process.argv.length) {
            console.error("ERROR: Argument '" + key + "' is missing value");
            return undefined;
        }

        if (rxScriptArgument.test(process.argv[i + 1])) {
            console.error("ERROR: Argument '" + key + "' is missing value");
            return undefined;
        }

        var argVal = process.argv[i + 1];
        console.log("Argument: '" + key + "' = '" + argVal + "'");
        return argVal;
    }

    console.error("ERROR: Argument: '" + key + "' could not be found");
    return undefined;
}

function ExtractDefAttribute(key, str) {
    var rxDefault = new RegExp(key + ":\\s*(.*)\n");

    if (!rxDefault.test(str))
        return undefined;

    return rxDefault.exec(str)[1];
}

function ExtractDefArrayAttribute(key, str) {
    if (ExtractDefAttribute(key, str) == undefined)
        return undefined;

    var searchKey = key + ":\n";
    var sub = str.substr(str.indexOf(searchKey) + searchKey.length)
    var nextAttribute = rxAttribute.exec(sub);
    if (nextAttribute != undefined)
        sub = sub.substr(0, sub.indexOf(nextAttribute));

    var array = sub.match(rxAttributeArgument);
    //console.log(str,sub,array);
    return array;
}

var srcDir = ExtractProcessArgument("srcDir");
var outDir = ExtractProcessArgument("outDir");
var curDir = process.argv[1];

if (srcDir == undefined) {
    console.error("ERROR: srcDir must be defined");
    process.exit(1);
}

if (srcDir != undefined) srcDir = srcDir.replace(/\/?$/, '/');
if (outDir != undefined) outDir = outDir.replace(/\/?$/, '/');
curDir = curDir.match(rxPath)[0];

if (outDir == undefined)
    outDir = curDir + "out/";
else if (outDir.startsWith("."))
    outDir = curDir + outDir;

if (!fs.existsSync(outDir))
    fs.mkdirSync(outDir);

/*
    TODO: Add default values & checks
*/

class IntermediateDef {
    constructor(rawData) {
        rawData = rawData.replace(rxEndl, "\n");
        rawData = rawData.replace(rxQuotes, "\\\"");

        this.name = ExtractDefAttribute("Name", rawData);
        if (this.name == undefined) {
            console.error("ERROR: Corrupt Def File");
            return;
        }

        this.func = ExtractDefAttribute("Function", rawData);
        this.desc = ExtractDefAttribute("Summary", rawData);
        this.callon = ExtractDefAttribute("CallOn", rawData);
        this.example = ExtractDefAttribute("Example", rawData);

        this.reqArgs = ExtractDefArrayAttribute("RequiredArgs", rawData);
        this.optArgs = ExtractDefArrayAttribute("OptionalArgs", rawData);
    }
}

function TSGenerateDef(iDef, index) {
    var str = "";
    if (index == 0)
        str = "\nvar tmpDef = new Def_Function;\n"
    else
        str = "tmpDef = new Def_Function;\n"

    str += "tmpDef.name = \"" + iDef.name + "\"\;\n";

    if (iDef.func != undefined)
        str += "tmpDef.decl = \"" + iDef.func + "\"\;\n";
    if (iDef.desc != undefined)
        str += "tmpDef.desc = \"" + iDef.desc + "\"\;\n";
    if (iDef.callon != undefined)
        str += "tmpDef.callon = \"" + iDef.callon + "\"\;\n";
    if (iDef.example != undefined)
        str += "tmpDef.example = \"" + iDef.example + "\"\;\n";

    if (iDef.reqArgs != undefined) {
        str += "tmpDef.reqArgs = [	";
        for (var i = 0; i < iDef.reqArgs.length; i++) {
            if (i != 0)
                str += "					";

            str += "\""
            str += iDef.reqArgs[i];
            str += "\""

            if (i + 1 < iDef.reqArgs.length)
                str += ",\n";
        }
        str += "];\n";
    }

    if (iDef.optArgs != undefined) {
        str += "tmpDef.optArgs = [	";
        for (var i = 0; i < iDef.optArgs.length; i++) {
            if (i != 0)
                str += "					";

            str += "\""
            str += iDef.optArgs[i];
            str += "\""

            if (i + 1 < iDef.optArgs.length)
                str += ",\n";
        }
        str += "];\n";
    }

    str += "defs.push(tmpDef);\n\n"

    return str;
}

function fsReadFileCallback(err, data) {
    if (err)
        throw err;
}

var outData = "";
var outIndex = 0;

function defImportFile(file, index) {
    var def = new IntermediateDef(fs.readFileSync(srcDir + file, 'utf8', fsReadFileCallback));
    outData += TSGenerateDef(def, outIndex);
    outIndex++;
}

function fsReadDirCallback(err, files) {
    if (err)
        throw err;

    files.forEach(defImportFile);

    console.log("Opening 'template.ts':\n    " + curDir + 'template.ts');

    var templateData = fs.readFileSync(curDir + 'template.ts', 'utf8', fsReadFileCallback);
    outData = templateData + outData;
    outData = outData.replace(rxEndl, "\r\n");

    console.log("Writing '" + outfile + "':\n   " + outDir + outfile);
    fs.writeFileSync(outDir + outfile, outData);

    console.log("Complete!")
    process.exit(0);
}

fs.readdir(srcDir, fsReadDirCallback);
