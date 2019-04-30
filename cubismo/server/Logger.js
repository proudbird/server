"use strict";

const   Reset = "\x1b[0m",
        Bright = "\x1b[1m",
        Dim = "\x1b[2m",
        Underscore = "\x1b[4m",
        Blink = "\x1b[5m",
        Reverse = "\x1b[7m",
        Hidden = "\x1b[8m",
        
        FgBlack = "\x1b[30m",
        FgRed = "\x1b[31m",
        FgGreen = "\x1b[32m",
        FgYellow = "\x1b[33m",
        FgBlue = "\x1b[34m",
        FgMagenta = "\x1b[35m",
        FgCyan = "\x1b[36m",
        FgWhite = "\x1b[37m",
        
        BgBlack = "\x1b[40m",
        BgRed = "\x1b[41m",
        BgGreen = "\x1b[42m",
        BgYellow = "\x1b[43m",
        BgBlue = "\x1b[44m",
        BgMagenta = "\x1b[45m",
        BgCyan = "\x1b[46m",
        BgWhite = "\x1b[47m";

function log(type, format, message, stack) {
    const log = [];
    const timestamp = new Date().toLocaleString();
    log.push(timestamp);
    log.push("[" + type + "]");
    log.push(message);
    console.log(format + log.join(" "));
    if(stack) {
        if(stack.stack) {
            stack = stack.stack;
        }
        const _stack = stack.split('\n');
        let newStack = [];
        for(let i = 0; i < _stack.length; i++) {
            //if(_stack[i].includes(path.join(__dirname, "core"))) {
            newStack.push(_stack[i]);
            //}
        }
        newStack = newStack.join('\n');
        console.log(newStack);
    };
    console.log(Reset, " ");
}

class Log{
    
    warn (message) {
        log("WARNING", FgMagenta + Bright, message);
    }
    
    info(message) {
        log("INFO", FgWhite + Blink, message);
    }
    
    error(message, e) {
        log("ERROR", FgRed + Bright, message, e ? e : undefined);
    }
    
    fatal(message, e) {
        log("FATAL", FgRed + Bright + BgWhite, message, e ? e : undefined);
    }
    
    debug(message, e) {
        log("DEBUG", FgYellow, message, e ? e.stack : undefined);
    }
}

global.Log  = new Log();

