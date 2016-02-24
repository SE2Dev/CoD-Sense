'use strict'

/*
    Todo: Find better / safer alternative
*/
export function PathToURI(path) {
    path = path.replace(/\\/g, '/');
    path = path.replace(/\s/g, '%20');
    var drive = /(.)\:\//
    return path.replace(drive, 'file:///$1:/');
}
