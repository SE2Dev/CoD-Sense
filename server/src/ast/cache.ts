'use strict'

import {console, connection} from "../server"

export var cache = {};

export function IsCached(key: string)
{
    return cache[key] != undefined;
}

export function Add(key: string, value?: any)
{
    if (value)
        cache[key] = value;
    else
        cache[key] = {};
    return cache[key];
}

export function Remove(key: string)
{
    delete cache[key];
}

export function Modify(key: string, callback: (item: any) => any)
{
    callback && callback(cache[key]);
}

export function Item(key: string)
{
    return cache[key];
}
