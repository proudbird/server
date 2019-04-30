/* global Tools */
"use strict";
const _ = require('lodash');
const _async = require("async");

const View = require("../UI/View.js");
//const Item = require('./Item.js');

function ItemCollection(collection, owner, name, model, application) {

    if(!collection) {
        collection = [];
    }
  
    collection.__proto__.add = function (value) {
        if(Tools.isEmpty(value)) {
            value = {};
        }
        value.order = this.length + 1;
        const instance = model.build(value);
        const newItem = new owner.constructor({
            instance: instance,
            model: model,
            application: application
        });
        newItem.view = owner.view;
        let values = owner._.instance[name];
        if (!values) {
            values = owner._.instance[name] = [];
        }
        values.push(newItem);
        return newItem;
    }

    collection.__proto__.count = function () {
        return owner._.instance[name].length;
    }

    collection.__proto__.remove = async function () {
        await owner._.instance[owner._.model.associations[name].accessors.remove]();
        return self;
    }

    return collection;

}
module.exports = ItemCollection;