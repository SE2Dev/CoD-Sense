'use strict'

import {RequestType} from 'vscode-languageclient'

export namespace CoDSenseContentRequest {
    export const type: RequestType<string, string, any> = { get method() { return 'codsense/content'; } };
}

export namespace CoDSenseWorkspaceUrisRequest {
    export const type: RequestType<string, string[], any> = { get method() { return 'codsense/workspace_uris'; } };
}