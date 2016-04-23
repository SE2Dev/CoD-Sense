'use strict';

export const extensionPath = Normalize(__dirname + "/../../");
export const installationPath = StripFile(process.execPath);
export const vscodeModulesPath = Normalize(installationPath + "resources\\app\\node_modules\\");

export function Init(extensionPath: string) {
    return process.execPath;
}

export function StripFile(path: string) {
    return /.+[\\|\/]/.exec(path);
}

export function StripDirectory(path: string) {
    return /[^\\|\/]*$/.exec(path);
}

export function Normalize(path: string) {
    let str = path.replace(/\\/g, "/");
    if (str[str.length - 1] != "/")
        str += "/";

    return str;
}

export function BuiltInModule(moduleName: string) {
    return vscodeModulesPath + moduleName;
}

