'use strict'
import {console, connection} from "../server"
import {    DidChangeConfigurationParams, 
            Location, Range, Position } from "vscode-languageserver"

import {CoDSenseWorkspaceUrisRequest} from '../request'
import * as ast from "../analyzer"

export function DidChangeConfigurationHandler(params: DidChangeConfigurationParams): void
{
    connection.sendRequest(CoDSenseWorkspaceUrisRequest.type, "gsc").then(
        function(files) //Resolved
        {
            ast.analyzeWorkspace(files);
        },
        function(rejectReason) //Rejected
        {
            console.error("Rejected! - Couldn't get the workspace file list");
            return;
        });
}