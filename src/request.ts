'use strict'

import * as vscode from "vscode";
import { RequestType } from 'vscode-languageclient'

export namespace CoDSenseContentRequest {
    export const type = new RequestType<string, string, any, any>('codsense/content');
}

export namespace CoDSenseResolveDirectoryRequest {
    export const type = new RequestType<string, string[], any, any>('codsense/vfs_resolvedirectory')
}

export namespace CoDSenseWorkspaceUrisRequest {
    export const type = new RequestType<string, string[], any, any>('codsense/workspace_uris')
}

export function HandleContentRequest(uri_string: string) {
    let uri = vscode.Uri.parse(uri_string);
    return vscode.workspace.openTextDocument(uri).then(
        doc => {
            return doc.getText();
        }, error => {
            return Promise.reject(error);
        });
}

export function HandleWorkspaceUrisRequest(languageId: string) {
    let include = "**/*." + languageId;
    return vscode.workspace.findFiles(include, "").then(
        files => {
            var out = new Array<string>();
            for (var i = 0; i < files.length; i++) {
                out.push(files[i].fsPath);
            }

            return out;
        }, error => {
            return Promise.reject(error);
        });
}