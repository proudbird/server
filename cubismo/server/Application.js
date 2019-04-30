/* globals Tools Log */
"use strict";
const _      = require("lodash");
const fs     = require("fs");
const path   = require("path");
const _async = require("async");

const Require    = require("./Require");
const MainWindow = require("./UI/Window.js");

const Type = require('./Classes/Type.js');

const constructors = {};
constructors.Base         = require('./Classes/Base.js');
constructors.Collection   = require('./Classes/Collection.js');
constructors.Cubes        = require('./Classes/Cubes.js');
constructors.Cube         = require('./Classes/Cube.js');
constructors.Common       = require('./Classes/Common.js');
constructors.Сonstants    = require('./Classes/Сonstants.js');
constructors.Catalogs     = require('./Classes/Catalogs.js');
constructors.Recorders    = require('./Classes/Recorders.js');
constructors.Registers    = require('./Classes/Registers.js');
constructors.Enumerations = require('./Classes/Enumerations.js');

const DBConnection   = require('./DB/Connection.js');
const SystemData     = require('./DB/SystemData.js');
const ModelGenerator = require('./ModelGenerator.js');
const Query = require('./Query.js');


function Application(name, dirname, filename) {

    const _ = {};
    this._ = {};

    constructors.Collection.call(this, undefined, undefined, name, dirname, filename);

    Object.defineProperty(this._, "id", { value: Tools.GUID(), writable: false });

    this.__proto__.getId = function() {
        return this._.id;
    };

    this.__proto__.subscribeOnClient = function(clientId, connect) {
        if(!Tools.has(this._, "clientSubscribers")) {
            this._.clientSubscribers = {};
        }
        this._.clientSubscribers[clientId] = { connect: connect }
    }

    this._.connection = new DBConnection(this);

    const p = path.join(__dirname, "./Query.js");
    
    this.Query = new Query(this, this._.connection.driver);

    _.modelDefinition = {};
    
    this.init = function() {
        const self = this;

        const mainFunction = function(callback) {
            self._.connection.authenticate()
            .then(() => {
                try {
                    defineApplicationStructure(self, _.modelDefinition);
                } catch(err) {
                    Log.error("Unsuccessful attempt to define application structure");
                    callback(err);
                }
    
                SystemData.define(self._.connection.driver);
                loadNumerators(self._.connection)
                .then(numerators => {
                    try {
                        defineModelStructure(self, self._.connection.driver, _.modelDefinition, numerators);
                    } catch(err) {
                        Log.error("Unsuccessful attempt to define application model structure");
                        callback(err);
                    }
       
                    syncDBStructure(self, self._.connection)
                    .then(() => {
                        callback(null);
                    })
                    .catch(err => {
                        Log.error("Unsuccessful attempt to synchronize application model structure with database");
                        callback(err);
                    })
                })
                
            })
            .catch(err => {
                callback(err);
            })
        }
    
        return new Promise(function(resolve, reject) {
            mainFunction(function(error, result) {
                error ? reject(error) : resolve(result);
            });
        });
    }

    this.__proto__.show = function(client) {
        
        const _arguments = {};
        _arguments.options     = {};
        _arguments.params      = {};
        _arguments.name        = "MainWindow";
        _arguments.application = this;
        _arguments.client      = client;
    
        const view = new MainWindow(_arguments);

        const mainFunction = function(callback) {
            view.show()
            .then((viewConfig) => {
                return callback(null, viewConfig);
            })
            .catch((err) => {
                return callback(err);
            })
        }

        return new Promise(function(resolve, reject) {
            mainFunction(function(error, result) {
                error ? reject(error) : resolve(result);
            });
        });
    }

    this.views = {};

    Object.defineProperty(this.__proto__, "window", {
        enumerable: false,
        set() {
            throw new Error("It is not allowed to change property 'window' of an application!");
        },
        get() {
            return this.views[process.env.WINDOW];
        }
    });

    Object.defineProperty(this.__proto__, "lang", {
        enumerable: false,
        set() {
            throw new Error("It is not allowed to change property 'lang' of an application!");
        },
        get() {
            return process.env.LANG;
        }
    });
}
module.exports = Application;

function defineApplicationStructure(application, appModelDefinition) {

    const appDir = application.dirname;
    const registredClasses = ["Common", "Сonstants", "Catalogs", "Recorders", "Registers", "Enumerations"];

    const _cubes = new constructors.Cubes(application, undefined, undefined, application.filename, undefined)
    application.addElement("Cubes", _cubes);

    const files = fs.readdirSync(appDir);
    for (let i = 0; i < files.length; i++) {
        let cubeFile = files[i];
        let cubeDir = path.join(appDir, cubeFile);
        if (fs.statSync(cubeDir).isDirectory()) {
            if (cubeFile.match(/\.|\../) == null) {
                let cubeName = cubeFile;
                let cubeModuleFile = path.join(cubeDir, 'Cube.js');
                if (fs.existsSync(cubeModuleFile)) {

                    const _cube = new constructors.Cube(application, undefined, cubeName, cubeDir, "Cube.js")
                    application.addElement(cubeName, _cube);
                    _cubes.addElement(cubeName, _cube);

                    registredClasses.forEach(className => {
                        const _constructor = constructors[className];
                        const _class = new _constructor(application, _cube, className, cubeDir, undefined);
                        _cube.addElement(className, _class);
                    });

                    const _commonModules = new constructors.Collection(application, _cube, "Modules", path.join(cubeDir, "Common", "Modules"), undefined);
                    const _common = _cube.Common;
                    _common.addElement("Modules", _commonModules);

                    let cubeFiles = fs.readdirSync(cubeDir);
                    for (let i = 0; i < cubeFiles.length; i++) {

                        let classFile = cubeFiles[i];
                        let classDir = path.join(cubeDir, classFile);
                        if (fs.statSync(classDir).isDirectory()) {
                            let className = classFile;
                            if (!registredClasses.includes(className)) {
                                continue;
                            }

                            let modelName = undefined;
                            let modelModuleFile = undefined;
                            let modelDefinition = undefined;
                            let modelDefinitionName = undefined;

                            let classFiles = fs.readdirSync(classDir);
                            for (let i = 0; i < classFiles.length; i++) {
                                let classFile = classFiles[i];
                                let splitedName = classFile.split(".");
                                if (splitedName[0] === className && splitedName[2] === "js") {
                                    modelName = splitedName[1];
                                    modelModuleFile = path.join(classDir, classFile);
                                }
                                if (splitedName[0] === className && splitedName[2] === "Model" && splitedName[3] === "json") {
                                    modelDefinitionName = splitedName[1];
                                    modelDefinition = require(path.join(classDir, classFile));
                                }
                                if (className === "Common" &&
                                    splitedName[0] === className &&
                                    splitedName[1] === "Modules" &&
                                    splitedName[3] === "js") {
                                    const commonModuleName = splitedName[2];

                                    const _commonModules = _cube.Common.Modules;
                                    const _module = new constructors.Base(application, _cube, commonModuleName, path.join(cubeDir, "Common"), classFile);
                                    _commonModules.addElement(commonModuleName, _module);
                                    Require(path.join(_module.dirname, _module.filename), { Application: application, Cube: _cube, Module: _module } );
                                }

                                /**
                                 * @todo There can be poblems on parsing object files
                                 * @todo Should change the algorithm
                                 */
                                if (modelDefinition && modelDefinitionName) {
                                    for (let key in modelDefinition) {
                                        modelDefinition[key].id = key;
                                        appModelDefinition[key] = {
                                            definition: modelDefinition[key],
                                            module: modelModuleFile
                                        };
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

async function loadNumerators(connection) {
    // const dbDriver = connection.driver;
    // const result = await dbDriver.models.SY_Nummirators.findAll();
    const numerators = {};
    // result.forEach(element => {
    //     numerators[element.reference] = element;
    // })
    return numerators;
}

function defineModelStructure(application, connection, appModelDefinition, numerators) {

    ModelGenerator.on("modelready", function(model, moduleFile) {
        // firstly load common methods for the class
        //Require(path.join(__dirname, "./Classes/Commons.js"), { Application: application, Model: model, Tools: Tools, Log: Log });
        // then load specific methods for the class
        //Require(path.join(__dirname, "./Classes/" + model.class + ".Model.js"), { Application: application, Model: model, Tools: Tools, Log: Log });
        // then load methods, determined in model module
        //Require(moduleFile, { Application: application, Module: model, Tools: Tools, Log: Log });
        // bind model to the class
        const _class = application[model.cube.name][model.class];
        //_class.addElement(model.modelName, model);

        const _arguments = {
            application: application,
            model: model
        }
        const _type = new Type(_arguments);
        _class.addElement(_type.name, _type);

        model.numerator = numerators[model.tableName] || connection.models.SY_Nummirators.build({ reference: model.tableName, number: 0, period: null, parent: null });
    });

    ModelGenerator.define(application, connection, appModelDefinition);

}

function syncDBStructure(application, connection) {

    const driver = connection.driver;
    const qi = driver.queryInterface;

    const safeChanges = [];
    const unSafeChanges = [];
    
    const serviceFields = ["id", "droped", "isFolder", 
            "booked", "Date", "parentId", "ownerId",
            "createdAt", "updatedAt", "deletedAt", "order"];

    function changeColumn(model, tableName, modelCol, dbCol, rows) {

        let type;
        let length;
        if(dbCol.type.includes("CHARACTER VARYING")) {
            type = "STRING";
            const start = dbCol.type.indexOf("(") + 1;
            const end = dbCol.type.indexOf(")");
            length = parseInt(dbCol.type.substring(start, end));
        } else if(dbCol.type === "DATE") { 
            type = "DATEONLY";
        } else if(dbCol.type === "TIMESTAMP WITH TIME ZONE") { 
            type = "DATE";
        } else {
            type = dbCol.type;
        }

        if(type === "STRING" && modelCol.type.key === "STRING") {
            if(length === modelCol.type._length) {
                // nothing to change
            } else if(length < modelCol.type._length) {
                safeChanges.push({ 
                    action:    "changeColumn",
                    message:    "Object attribute modified (" + modelCol.field + ")",
                    tableName:  tableName, 
                    key:        modelCol.field, 
                    attribute:  { type: modelCol.type },
                    model: model
                });
            } else {
                if(!rows) {
                    // table doesn't have rows, so we can change column without data loss
                    safeChanges.push({ 
                        action:    "changeColumn",
                        message:    "Object attribute modified (" + modelCol.field + ")",
                        tableName:  tableName, 
                        key:        modelCol.field, 
                        attribute:  { type: modelCol.type },
                        model: model
                    });
                } else {
                    unSafeChanges.push({ 
                        action:    "changeColumn",
                        message:    "Object attribute modified (" + modelCol.field + ")",
                        tableName:  tableName, 
                        key:        modelCol.field, 
                        attribute:  { type: modelCol.type },
                        model: model
                    });
                }
            }
        } else if(type === "REAL" && modelCol.type.key === "FLOAT") {
            // nothing to change
        } else if(type === "REAL" && modelCol.type.key === "DECIMAL") {
            // nothing to change
        } else if(type === modelCol.type.key) {
            // nothing to change
        } else {
            if(!rows) {
                // table doesn't have rows, so we can change column without data loss
                safeChanges.push({ 
                    action:    "changeColumn",
                    message:    "Object attribute modified (" + modelCol.field + ")",
                    tableName:  tableName, 
                    key:        modelCol.field, 
                    attribute:  { type: modelCol.type },
                    model: model
                });
            } else {
                unSafeChanges.push({ 
                    action:    "changeColumn",
                    message:    "Object attribute modified (" + modelCol.field + ")",
                    tableName:  tableName, 
                    key:        modelCol.field, 
                    attribute:  { type: modelCol.type },
                    model: model
                });
            }
        }
    }

    function compareColumns(model, tableName, description, dbStructure) {
        var self = this;

        const mainFunction = function(callback) {
            _async.forEach(model.fieldRawAttributesMap, function(modelCol, next) {
                if (!description[modelCol.field]) {
                    // table doesn't have such a column, so let's add it
                    safeChanges.push({ 
                        action:    "addColumn",
                        message:    "Object attribute added (" + modelCol.field + ")",
                        tableName:  tableName, 
                        key:        modelCol.field, 
                        attribute:  { type: modelCol.type },
                        model: model
                    });
                    // delete column from the list - it will allow us to detect those columns we need to delete
                    try {
                        delete dbStructure[tableName][modelCol.field];
                    } catch(err) {

                    }
                    return next(null);
                } else {
                    // table in DB has such a column
                    if(serviceFields.includes(modelCol.field)) {
                        // no needs to change service fields
                        return next(null);
                    } else {
                        const dbCol = description[modelCol.field];
                        model.count()
                        .then(rows => {
                            changeColumn(model, tableName, modelCol, dbCol, rows);
                            // delete column from the list - it will allow us to detect those columns we need to delete
                            try {
                                delete dbStructure[tableName][modelCol.field];
                            } catch(err) {

                            }
                            return next(null);
                        })
                        .catch(err => {
                            // delete column from the list - it will allow us to detect those columns we need to delete
                            //delete dbStructure[tableName][modelCol.field];
                            return next(err);
                        });
                    }
                }
            }, function(err) {
                callback(err);
            });
        };

        return new Promise(function(resolve, reject) {
            mainFunction(function(error, result) {
                error ? reject(error) : resolve(result);
            });
        });
    }

    function compareTables(driver, dbStructure) {
        var self = this;

        const mainFunction = function(callback) {
            _async.forEach(driver.models, function(model, next) {
                const tableName = model.tableName;
                if (!dbStructure[tableName]) {
                    // DB doesn't have such a table, so let's create it
                    safeChanges.push({ 
                        action:    "createTable",
                        message:    "New object added (" + model.tableName + ")",
                        tableName:  model.tableName, 
                        attributes: model.attributes, 
                        options:    model.options, 
                        model:      model
                    });
                    next();
                } else {
                    qi.describeTable(tableName)
                    .then(description => {
                        // delete table from the list - it will allow us to detect those table we need to drop
                        delete dbStructure[tableName];
                        return compareColumns(model, tableName, description, dbStructure)
                    })
                    .then(() => { next(null) })
                    .catch(err => {
                        next(err);
                    });
                }
            }, function(err) {
                callback(err);
            });
        }
        
        return new Promise(function(resolve, reject) {
            mainFunction(function(error, result) {
                error ? reject(error) : resolve(result);
            });
        });
    }

    function askChanges() {
        function log(message) {
            console.log(message);
        }

        const mainFunction = function(callback) {
            if(!safeChanges.length && !unSafeChanges.length) {
                return callback(null, 3);
            }

            log("----------------------------------------------------");
            log("Unsaved changes in application structure:".toUpperCase());
            log("----------------------------------------------------");
            
            if(safeChanges.length ) {
                log("\x1b[32m" + "Safe changes:");
                safeChanges.forEach(change => {
                    log("  " + change.message + ": " + change.tableName);
                })
            }

            log(" ");

            if(unSafeChanges.length ) {
                log("\x1b[31m" + "Unsafe changes (data loss possible):");
                unSafeChanges.forEach(change => {
                    log("  " + change.message + ": " + change.tableName);
                })
            }
            log("\x1b[0m" + "----------------------------------------------------");
            log(" ");

            const readline = require('readline');

            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            function wrongAnswer() {
                rl.question("Please, type 'Y' or 'N':  ", (answer) => {
                    if(answer.toUpperCase() === "Y") {
                        rl.close();
                        callback(null, 1);
                    } else if(answer.toUpperCase() === "N") {
                        rl.close();
                        callback(null, 2);
                    } else {
                        wrongAnswer();
                    }
                });
            }

            rl.question('Do you want to execute listed changes? [Y/N]: ', (answer) => {
                if(answer.toUpperCase() === "Y") {
                    rl.close();
                    callback(null, 1);
                } else if(answer.toUpperCase() === "N") {
                    rl.close();
                    callback(null, 2);
                } else {
                    wrongAnswer();
                }
            });
        }

        return new Promise(function(resolve, reject) {
            mainFunction(function(error, result) {
                error ? reject(error) : resolve(result);
            });
        });
    }

    function executeChanges() {

        const mainFunction = function(callback) {
            var changes = safeChanges.concat(unSafeChanges);
            _async.forEach(changes, function(change, next) {
                switch (change.action) {
                    case "createTable":
                        qi.createTable(change.tableName, change.attributes, change.options, change.model)
                        .then(result => {
                            Log.debug('Created object ' + change.model.name);
                            next(null);
                        })
                        .catch(err => {
                            Log.error("Unsuccessful attempt to create object " + change.model.name);
                            next(err);
                        });
                        break;
                    case "addColumn":
                        qi.addColumn(change.tableName, change.key, change.attribute)
                        .then(result => {
                            Log.debug('Added attribute ' + change.key + ' to object ' + change.model.name);
                            next(null);
                        })
                        .catch(err => {
                            Log.error("Unsuccessful attempt to add attribute " + change.key + " to object "  + change.model.name);
                            next(err);
                        })
                        break;
                    case "changeColumn":
                        qi.changeColumn(change.tableName, change.key, change.attribute)
                        .then(result => {
                            Log.debug('Changed attribute ' + change.key + ' in object ' + change.model.name);
                            next(null);
                        })
                        .catch(err => {
                            Log.error("Unsuccessful attempt to change attribute " + change.key + " in object "  + change.model.name);
                            next(err);
                        })
                        break;
                }
            }, function(err) {
                callback(err);
            })
        }

        return new Promise(function(resolve, reject) {
            mainFunction(function(error, result) {
                error ? reject(error) : resolve(result);
            });
        });
    }

    const mainFunction = function(callback) {
        connection.getDbStructure()
        .then(dbStructure => {
            return compareTables(driver, dbStructure)
        })
        .then(() => {
            return askChanges()
        })
        .then((result => {
            if(result === 1) {
                executeChanges()
                .then(() => {
                    callback(null);
                })
            } else if(result === 2) {
                console.log(" ");
                console.log("\x1b[33m" + "Application starting without sincronizing database structure!" + "\x1b[0m");
                callback(null);
            } else {
                // NOTHING TO DO
                callback(null);
            }
        }))
        .catch(err => {
            callback(err);
        })
    }

    return new Promise(function(resolve, reject) {
        mainFunction(function(error, result) {
            error ? reject(error) : resolve(result);
        });
    });
}