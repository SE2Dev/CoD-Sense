'use strict';

export function sleep(milliseconds) {
    var start = new Date().getTime();
    let current = 0;

    while (current < milliseconds) {
        current = new Date().getTime() - start;
    }
}