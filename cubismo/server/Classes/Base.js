/* globals TempStorage Tools Log*/
const fs      = require("fs");
const path    = require("path");
const Require = require("../Require");

function Base(application, cube, name, dirname, filename) {

    const _ = {};
    _.modules = {};
    
    Object.defineProperties(this, { 
        application: { value: application, enumerable: false, writable: false },
        cube: { value: cube, enumerable: false, writable: false },
        name: { value: name, enumerable: false, writable: false },
        dirname: { value: dirname, enumerable: false, writable: false },
        filename: { value: filename, enumerable: false, writable: false }
    });
    
    if(!filename) { return };

    const moduleFileName = path.join(dirname, filename);
    if(!fs.existsSync(moduleFileName)) { 
        throw new Error("Can't find module file '" + moduleFileName + "'"); 
    }
    const id = require.resolve(moduleFileName);
    let load = true;
    let storedModule = _.modules[id];
    if(storedModule) {
        let lastUpdated = fs.statSync(moduleFileName).mtime;
        if (lastUpdated.getTime() === storedModule.lastUpdated.getTime()) {
            load = false;
        }
    }

    if (load) {
        if(cube === undefined && filename === "Cube.js") {
            cube = this;
        }
        Require(moduleFileName, { Application: application, Module: this, Cube: cube });
        storedModule = { lastUpdated: fs.statSync(moduleFileName).mtime }
        _.modules[id] = storedModule;
    }
}
module.exports = Base;