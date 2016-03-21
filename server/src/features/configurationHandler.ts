'use strict'
import {console, connection} from "../server"

import * as vss from "vscode-languageserver"
import {    DidChangeConfigurationParams, 
            Location, Range, Position } from "vscode-languageserver"

import {CoDSenseWorkspaceUrisRequest} from '../request'
import * as ast from "../analyzer"

import * as vfs from "../util/vfs"
import fs = require('fs');

export interface ISettings
{
    libs: {};
    active_lib: string; 
}

export class IConfiguration
{
    settings: ISettings;
    workspacePath: string;
    libraryPath: string;
}

export var config: IConfiguration = new IConfiguration;

export function DidChangeConfigurationHandler(params: DidChangeConfigurationParams): void
{
    vss.WorkspaceChange
    config.settings = params.settings["cod-sense"];
    console.warn(JSON.stringify(config));
    if(config.settings.active_lib != "" && config.settings.libs[config.settings.active_lib])
    {
        config.libraryPath = config.settings.libs[config.settings.active_lib];

        try
        {
            let stat = fs.lstatSync(config.libraryPath);
            if(!stat.isDirectory())
            {   
                console.warn(`Config Key '${config.settings.active_lib}' has invalid directory path '${config.libraryPath}' - Ignoring cod-sense.active_lib`);
                config.libraryPath = "";
            }
        }
        catch(error)
        {
            console.error(error + " - Ignoring cod-sense.active_lib");
            config.libraryPath = "";
        }           
    }
    
    if(config.libraryPath != "")
        vfs.AddPath(config.libraryPath);
}