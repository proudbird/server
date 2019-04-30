/* global Tools */
"use strict";
const _ = require('lodash');
const _async = require("async");

const View = require("../UI/View.js");
const ItemCollection = require('./ItemCollection.js');
const Numerator = require('./Numerating.js');

function Item(_arguments) {

    let instance = _arguments.instance;
    if (Tools.has(instance, "_.instance")) {
        instance = instance._.instance;
    }

    this._ = {};
    this._.instance = instance;
    this._.model = _arguments.model;
    this._.application = _arguments.application;
    
    const self = this;
    const definition = this._.model.definition;

    if (definition.owners && definition.owners.length) {
        Object.defineProperty(this, "Owner", {
            get: function () {
                return this._.instance.Owner;
            },
            set: function (value) {
                this._.instance.Owner = value;
                this.setValue("ownerId", value.id);
                return this;
            }
        })
    }

    if (definition.multilevel) {
        Object.defineProperty(this, "Parent", {
            get: function () {
                return this._.instance.Parent;
            },
            set: function (value) {
                this._.instance.Parent = value;
                this.setValue("parentId", value.id);
                return this;
            }
        })
    }

    if (definition.codeLenght) {
        Object.defineProperty(this, "Code", {
            get: function () {
                const value = this._.instance.getDataValue("Code");
                return value;
            },
            set: function (value) {
                this.setValue("Code", value);
                return this;
            }
        })
    }

    if (definition.nameLenght) {
        Object.defineProperty(this, "Name", {
            get: function () {
                let fieldId = "Name";
                if (definition.nameLang && definition.nameLang.length) {
                    fieldId = "Name_" + this._.application.lang;
                }
                const value = this._.instance.getDataValue(fieldId);
                return value;
            },
            set: function (value) {
                this.setValue("Name", value);
                return this;
            }
        })
    }

    for (let key in this._.model.definition.attributes) {
        const attribute = definition.attributes[key];
        if (attribute.type.dataType === "FK") {
            const association = this._.model.associations[key];
            Object.defineProperty(this, key, {
                get: function () {
                    let instance = self._.instance[key];
                    if(Tools.isEmpty(instance)) {
                        instance = association.target.build();
                    }
                    const newItem = new Item({
                        application: self._.application,
                        instance: instance,
                        model: association.target
                    });
                    return newItem;
                },
                set: function (value) {
                    this.setValue(key, value);
                    return this;
                }
            })
        } else {
            Object.defineProperty(this, key, {
                get: function () {
                    const value = self.getValue(key)
                    return value;
                },
                set: function (value) {
                    this.setValue(key, value);
                    return this;
                }
            })
        }
    }

    for (let key in definition.collections) {
        const collection = definition.collections[key];
        Object.defineProperty(this, collection.name, {
            enumerable: true,
            get: function () {
                let itemCollection = this._.instance[collection.name];
                const association = this._.model.associations[collection.name];
                itemCollection = ItemCollection(itemCollection, this, collection.name, association.target, this._.application);
                 
                return itemCollection;
            }
        });
    }

    this.__proto__.show = function (_arguments) {
        if (!_arguments) {
            _arguments = {};
        }
        _arguments.type = this;
        _show(this._.application, this, _arguments);
    }

    this.__proto__.save = async function () {
        const self = this;
        const instance = this._.instance;
        const isNewRecord = instance.isNewRecord;
        try{
            const result = await instance.save()
            _saveAssociations(this, result);
            if (Tools.has(self, "_.model.subscribers")) {
                Tools.forOwn(self._.model.subscribers, subscriber => {
                    subscriber.update(self, isNewRecord ? "create" : "update");
                })
            }
            self.saved = true; 
            if(isNewRecord) {
                const numerator = self._.model.numerator;
                numerator.number = self.Code;
                numerator.new = 0;
                numerator.full = undefined;
                numerator.save();
            }    
        } catch(err) {
            Log.error("Error on saving item", err);
        }
        return instance;
    }

    this.__proto__.setNewCode = async function (prefix) {
        this.Code = await Numerator.nextCode(this._.application, this._.model, prefix);
    }

    this.__proto__.delete = async function (immediate) {
        const self = this;
        await _delete(this, immediate);
        if (Tools.has(self, "_.model.subscribers")) {
            Tools.forOwn(self._.model.subscribers, subscriber => {
                subscriber.update(self, "delete");
            })
        }
        return Promise.resolve(null);
    }

    this.__proto__.get = function (param) {
        const instance = this._.instance;
        return instance.get(param);
    }

    this.__proto__.set = function (param1, param2, param3) {
        const instance = this._.instance;
        return instance.set(param1, param2, param3);
    }

    this.__proto__.getValue = function (property, lang) {
        lang = lang || this._.application.lang;
        const definition = this._.model.definition;
        let instance = this._.instance;
        if (Tools.has(instance, "_.instance")) {
            instance = instance._.instance;
            if (Tools.has(instance, "_.instance")) {
                instance = instance._.instance;
            }
        }
        if (!instance) {
            return undefined;
        }
        let value;
        let element;
        let fieldId = property;
        if (property === "Name") {
            if (definition.nameLang && definition.nameLang.length) {
                fieldId = fieldId + "_" + lang;
            }
        } else if (property === "id") {
            return instance.id;
        } else if (property === "Code") {
            return instance.Code;
        } else if (property === "Parent") {
            return instance.Parent;
        } else if (property === "Owner") {
            return instance.Owner;
        } else if (property === "Owner") {
            return instance.Owner;
        } else {
            element = definition.attributes[property];
            if (element.type.lang && element.type.lang.length) {
                fieldId = element.fieldId + "_" + lang;
            } else if (element.type.dataType === "FK") {

            } else {
                fieldId = element.fieldId;
            }
        }
        value = instance.getDataValue(fieldId) || "";
        return value;
    }

    this.__proto__.setValue = function (property, newValue, lang) {
        const self = this;

        function _setValue(fieldId, newValue) {
            let value = newValue;
            const itWasChangerdOnClient = value.itWasChangerdOnClient;
            if (itWasChangerdOnClient) {
                value = newValue.value;
                if (typeof value === "object" && value) {
                    self._.instance[fieldId] = value._.instance;
                    self._.instance[self._.model.associations[fieldId].foreignKey] = value.getValue("id");
                } else {
                    self._.instance.setDataValue(fieldId, value);
                }
            } else {
                if (typeof value === "object" && value) {
                    self._.instance[fieldId] = value._.instance;
                    self._.instance[self._.model.associations[fieldId].foreignKey] = value.getValue("id");
                } else {
                    self._.instance.setDataValue(fieldId, value);
                }
                if (self.view) {
                    let message;
                    if (self._.model.class === "Collection") {
                        Tools.forIn(self.view, element => {
                            const dataLink = Tools.get(element, "config.dataLink");
                            if (dataLink && dataLink.includes(self._.model.modelName)) {
                                const itemValue = self.toJSON();
                                message = {
                                    directive: "updateItem",
                                    elementId: element.config.id,
                                    arguments: [self.getValue("id"), itemValue]
                                }
                            }
                        });
                    } else {
                        if (typeof value == "object" && value) {
                            value = {
                                id: value.getValue("id"),
                                presentation: value.getValue("Name"),
                                model: value._.model.name
                            }
                        }
                        message = {
                            directive: "setValue",
                            elementId: self.view[property].config.id,
                            arguments: [value]
                        }
                    }

                    self._.application.window.directiveToClient("directive", message, async function (response) {
                        if (response.err) {
                            Log.error("Unsuccessable atempt to change value of <" + property + "> on client.");
                        }
                    })
                }
            }
        }

        lang = lang || this._.application.lang;
        const model = this._.model;
        const definition = this._.model.definition;
        const instance = this._.instance;
        let fieldId = property;
        if (property === "Name") {
            if (definition.nameLang && definition.nameLang.length) {
                fieldId = fieldId + "_" + lang;
            }
        } else if (property === "id") {
            throw new Error("It is not allowed to change 'id' of an item");
        } else if (property === "Code") {
            fieldId = "Code";
        } else if (property === "Parent") {
            instance.Parent = newValue.value || newValue;
            if (newValue) {
                _setValue("Parent", newValue);
                //instance.setDataValue("parentId", value.getValue("id"));
            } else {
                _setValue("Parent", null);
                //instance.setDataValue("parentId", null);
            }
            return this;
        } else if (property === "Owner") {
            instance.Owner = newValue.value || newValue;
            if (newValue) {
                _setValue("Owner", newValue);
                //instance.setDataValue("ownerId", value.getValue("id"));
            } else {
                _setValue("Owner", null);
                //instance.setDataValue("ownerId", null);
            }
            return this;
        } else {
            const element = definition.attributes[property];
            fieldId = element.fieldId;
            if (element.type.lang && element.type.lang.length) {
                fieldId = element.fieldId + "_" + lang;
            }
            if (element.type.dataType === "FK") {
                fieldId = model.associations[property].identifier;
                if (newValue) {
                    _setValue(property, newValue);
                    //instance.setDataValue(fieldId, value.getValue("id"));
                } else {
                    _setValue(property, null);
                    //instance.setDataValue(fieldId, null);
                }
                return this;
            }
        }
        _setValue(fieldId, newValue);
        //instance.setDataValue(fieldId, value);
        return this;
    }

    this.__proto__.isFolder = function () {
        const instance = this._.instance;
        return instance.getDataValue("isFolder");
    }

    this.__proto__.getType = function () {
        const type = Tools.get(this._.application, this._.model.name);
        return type;
    }


    this.__proto__.toJSON = function () {
        let instance = this._.instance;
        if (Tools.has(instance, "_.instance")) {
            instance = instance._.instance;
        }
        const data = {
            id: instance.id,
            order: instance.order
        };
        if(this.Parent) {
            let parent = this.Parent;
            if(parent.Parent) {
                parent = parent.Parent;
            }
            data.Parent = {
                id: parent.getValue("id"),
                presentation: parent.getValue("Name")
            };
        }
        if(this.Owner) {
            let owner = this.Owner;
            if(owner.Owner) {
                owner = owner.Owner;
            }
            data.Owner = {
                id: owner.getValue("id"),
                presentation: owner.getValue("Name")
            };
        }
        const definition = this._.model.definition;
        for (let key in definition.attributes) {
            const element = definition.attributes[key];
            let fieldId = element.fieldId;
            if (element.type.lang && element.type.lang.length) {
                fieldId = fieldId + "_" + this._.application.lang;
            }
            let value;
            if (element.type.dataType === "FK") {
                const association = this._.model.associations[key];
                value = this[association.as];
                if (value) {
                    // TODO: presentation for collection items
                    let attribute = "Name";
                    const assDefinition = association.target.definition;
                    if(assDefinition.presentation) {
                        attribute = assDefinition.presentation;
                    }
                    data[key] = {
                        id: value.getValue("id"),
                        presentation: value.getValue(attribute)
                    }
                } else {
                    data[key] = {
                        id: "",
                        presentation: ""
                    }
                }
                data[key].model = association.target.name;
            } else {
                value = this._.instance[fieldId];
                data[key] = value;
            }
        }
        return data;
    }
}

function _show(Application, item, _arguments) {

    if (!_arguments) {
        _arguments = {};
    }
    if (!_.isPlainObject(_arguments)) {
        throw new Error("Arguments must be an object!");
    }

    if (_arguments.options && !_.isPlainObject(_arguments.options)) {
        throw new Error("Parametr 'options' must be an object!");
    } else {
        _arguments.options = {};
    }

    if (_arguments.params && !_.isPlainObject(_arguments.params)) {
        throw new Error("Parametr 'params' must be an object!");
    } else {
        _arguments.params = {};
    }

    if (!_arguments.name) {
        if (item.isFolder()) {
            _arguments.name = 'Folder';
        } else {
            _arguments.name = 'Item';
        }
    } else {
        _arguments.name = name;
    }

    _arguments.application = Application;
    _arguments.cube = item._.model.cube;
    _arguments.class = item._.model.class;
    _arguments.model = item._.model;
    _arguments.modelName = item._.model.modelName;
    _arguments.item = item;

    const view = new View(_arguments);
    view.show()
        .then(viewConfig => {
            //Application.window.ViewContainer.addView(viewConfig.config);
        })
        .catch(err => {
            Log.error("Error on adding view", err);
        })
};

function _saveAssociations(item, result) {

    function mainFunction(model, result, callback) {
        _async.forEach(model.associations, function (association, Next) {
            if (association.associationType === 'BelongsTo') {
                const setAccessor = association.accessors.set;
                let value = result[association.as];
                if (!value) {
                    return Next();
                }
                if (!value._ || !value._.instance) {
                    return Next();
                }
                value = value._.instance;
                result[setAccessor](value)
                    //result[setAccessor](value.id)
                    .then(() => {
                        return Next();
                    })
                    .catch((error) => {
                        console.log('Error on saving belongs to:/n ' + error);
                        return Next(error);
                    });
            } else if (association.associationType === 'HasMany') {
                const setAccessor = association.accessors.set;
                // remove all previose data
                var hasManyModel = association.target;
                hasManyModel
                    .destroy({
                        where: {
                            [association.foreignKey]: result.id
                        }
                    })
                    .then(() => {
                        const newValues = result[association.as];
                        if (newValues && newValues.length) {
                            const addAccessor = association.accessors.add;
                            let newInstances = [];
                            for (let i = 0; i < newValues.length; i++) {
                                let instance = newValues[i];
                                if (Tools.has(instance, "_.instance")) {
                                    instance = instance._.instance;
                                }
                                instance[association.foreignKeyField] = result.id;
                                if (instance.sequelize) {
                                    const data = instance.toJSON();
                                    data.order = i + 1;
                                    newInstances.push(data);
                                } else {
                                    // @TODO
                                    // здесь нужно что-то делать с вложенными зависимостями
                                    newInstances.push(instance);
                                }
                            }

                            hasManyModel
                                .bulkCreate(newInstances)
                                .then(() => {
                                    Next();
                                    return null;
                                })
                                .catch((error) => {
                                    Log.error('Error on saving collection', error);
                                    return Next(error);
                                });
                        } else {
                            return Next();
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        return Next(error);
                    });
            }
        }, function (error) {
            return callback(error, result);
        });
    }

    return new Promise(function (resolve, reject) {
        mainFunction(item._.model, result, function (error, result) {
            error ? reject(error) : resolve(result);
        });
    });
};

async function _delete(item, immediate) {
    const model = item._.model;
    const instance = item._.instance;
    if (immediate) {
        await instance.destroy({
            force: true
        });
        if (model.associations) {
            for (let key in model.associations) {
                const association = model.associations[key];
                if (association.associationType === 'HasMany') {
                    const setAccessor = association.accessors.set;
                    instance[setAccessor]([]);
                }
            }
        }
    } else {
        instance.dropped = true;
        await instance.save();
        await instance.destroy({
            force: false
        });
    }
    return null;
};

module.exports = Item;