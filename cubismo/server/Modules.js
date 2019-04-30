/* globals __ROOT Tools TempStorage Log*/
"use strict";

const nodeModule = require("module");
const _ = require("lodash");
const fs = require("fs");
const path = require("path");

const CubeModule = require('./Classes/CubeModule.js');

////////////////////////////////////////////////////////////////////////////////

const _modules = {};
const _commonModules = {};

function getCube(application, cubeName, cubeModuleFile) {

    let load = true;
    let storedModule = _modules[cubeName];
    if(storedModule) {
        let lastUpdated = fs.statSync(cubeModuleFile).mtime;
        if(lastUpdated == storedModule.lastUpdated) {
            load = false;
        }
    }
    
    if(load) {
        const cube = new CubeModule(cubeName, application, cubeName, path.dirname(cubeModuleFile))
        const cubeId = TempStorage.putValue(cube);
        const appId = TempStorage.putValue(application);
        const subWraper = [
            '"use strict";',
            'const Application = TempStorage.getValue("' + appId + '");',
            'const Cube = TempStorage.getValue("' + cubeId + '");'
        ];
        var loadedModule = _require(cubeModuleFile, subWraper);
        storedModule = {module: cube, lastUpdated: fs.statSync(cubeModuleFile).mtime}
        _modules[cubeName] = storedModule;
    }

    return storedModule.module;
}

function getClass(application, cubeName, className) {

}

function getCommonClass(application, cubeName) {

    return _commonModules[cubeName].Common;
}

function getCommonModules(application, cubeName) {

}

function getCommonModule(application, cubeName, commonModuleName) {

}

function getModelModule(application, cubeName, className, modelName) {

}
    
module.exports.getCube    = getCube;
module.exports.getClass         = getClass;
module.exports.getCommonClass   = getCommonClass;
module.exports.getCommonModules = getCommonModules;
module.exports.getCommonModule  = getCommonModule;
module.exports.getModelModule   = getModelModule;

function _require(pathToModule, subWraper, clearCache) {
    
    if(fs.existsSync(pathToModule)) {
        if (process.env.NODE_ENV === "development" || clearCache) {
            delete require.cache[require.resolve(pathToModule)];
        }
        try {
            // override original Node 'require' function to supply our module with additional 
            // global variables
            (function(originalModuleWrap) {
                nodeModule.wrap = function(script) {
                    const wrapper = [
                        '(function (exports, require, module, __filename, __dirname) { ',
                        '\n});'
                    ];
                    return wrapper[0] + subWraper.join(' ') + script + wrapper[1];
                };
            }(nodeModule.wrap));
            
            // loading our module
            var _module = require(pathToModule);
             
            // returning 'require' unction to the original state
            (function(originalModuleWrap) {
                nodeModule.wrap = function(script) {
                    const wrapper = [
                        '(function (exports, require, module, __filename, __dirname) { ',
                        '\n});'
                    ];
                    return wrapper[0] + script + wrapper[1];
                };
            }(nodeModule.wrap));

            return _module;
        }
        catch (err) {
            Log.error("Error on loadin module '" + pathToModule, err);
        }
    } else {
        Log.warn("Cannot find module '" + pathToModule + "'");
    }
}

function bindCube(application, cubeName, cubeModuleFile) {

    application[cubeName] = {};
    application.Cubes = {};
    application.Cubes[cubeName] = application[cubeName];

    const cubeDir = path.dirname(cubeModuleFile);
    application[cubeName].dir = cubeDir;
    application[cubeName].name = cubeName;

    bindCubeCommonMethods(application, cubeName);

    var subWraper = [
        '"use strict";',
        'var Application = Platform.applications["' + application.name + '"];',
        'var Cube = Platform.applications["' + application.name + '"]["' + cubeName + '"];',
        'var Dir = "' + cubeDir + '";',
    ];

    return _require(cubeModuleFile, subWraper, true);
}

function bindCubeCommonMethods(application, cubeName) {

    var fileName = __ROOT + '/core/cube.js';
    var subWraper = [
        '"use strict";',
        'var Application = Platform.applications["' + application.name + '"];',
        'var Cube = Platform.applications["' + application.name + '"]["' + cubeName + '"];',
    ];

    return _require(fileName, subWraper, true);
}

function bindCommonModule(application, cubeName, moduleName, commonModuleFile) {

    var subWraper = [
        '"use strict";',
        'var Application = Platform.applications["' + application.name + '"];',
        'var Cube = Platform.applications["' + application.name + '"]["' + cubeName + '"];',
        'var Module = Platform.applications["' + application.name + '"]["' + cubeName + '"].Common.Modules["' + moduleName + '"];',
        'var Dir = "' + path.dirname(commonModuleFile) + '";'
    ];

    return _require(commonModuleFile, subWraper, true);
}

function bindModelModule(application, cubeName, modelName, modelModuleFile) {

    var subWraper = [
        '"use strict";',
        'var Application = Platform.applications["' + application.name + '"];',
        'var Cube = Platform.applications["' + application.name + '"]["' + cubeName + '"];',
        'var Module = Platform.applications["' + application.name + '"]["' + cubeName + '"]["' + modelName + '"];',
        'var Dir = "' + path.dirname(modelModuleFile) + '";'
    ];

    return _require(modelModuleFile, subWraper, true);
}