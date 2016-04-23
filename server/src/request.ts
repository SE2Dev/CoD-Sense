'use strict'

import {RequestType} from 'vscode-languageserver'

export namespace CoDSenseContentRequest {
    export const type: RequestType<string, string, any> = { get method() { return 'codsense/content'; } };
}

export namespace CoDSenseResolveDirectoryRequest {
    export const type: RequestType<string, string[], any> = { get method() { return 'codsense/vfs_resolvedirectory'; } };
}

export namespace CoDSenseWorkspaceUrisRequest {
    export const type: RequestType<string, string[], any> = { get method() { return 'codsense/workspace_uris'; } };
}
