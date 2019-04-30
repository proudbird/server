/* globals Tools Log */
"use strict";

const provider = {};

provider.getDbStructure = function(connection, callback) {

    const dbStructre = {};

    const mainFunction = function(callback) {
        const query = [
            'SELECT table_name, column_name, data_type, column_default, is_nullable, ordinal_position, character_maximum_length',
            'FROM information_schema.columns',
            'WHERE table_schema NOT IN',
            "('pg_catalog', 'information_schema')",
            'AND table_catalog IN',
            "('" + connection.config.database + "')"
        ];

        connection.query(query.join(" "))
            .then(result => {
                for (let i = 0; i < result[0].length; i++) {
                    const definition = result[0][i];
                    if (!definition || !definition.table_name || !definition.column_name) {
                        continue;
                    }
                    if (!dbStructre[definition.table_name]) {
                        dbStructre[definition.table_name] = {};
                    }
                    if (!dbStructre[definition.table_name][definition.column_name]) {
                        dbStructre[definition.table_name][definition.column_name] = {};
                    }

                    const column = dbStructre[definition.table_name][definition.column_name];
                    column.dataType = definition.data_type;
                    column.length = definition.character_maximum_length;
                    column.defaultValue = definition.column_default;
                    column.required = definition.is_nullable;
                    column.position = definition.ordinal_position;
                }

                return callback(null, dbStructre);
            })
            .catch(err => {
                return callback(err);
            })
    };

    if (callback && typeof callback === "object") {
        return mainFunction(callback);
    }

    return new Promise(function(resolve, reject) {
        mainFunction(function(error, result) {
            error ? reject(error) : resolve(result);
        });
    });
}

provider.createTable = function(connection, model, callback) {

    const mainFunction = function(callback) {
        const query = [
            'CREATE TABLE "' + model.tableName + '" ('];
            
        for(let key in model.attributes) {
            const column = model.attributes[key];
            query.push('"' + column.feildName + '" ' + type + ' ' + options + ',')
        }

        connection.query(query)
            .then(result => {
                return callback(null, result);
            })
            .catch(err => {
                return callback(err);
            })
    };

    if (callback && typeof callback === "object") {
        return mainFunction(callback);
    }

    return new Promise(function(resolve, reject) {
        mainFunction(function(error, result) {
            error ? reject(error) : resolve(result);
        });
    });
}
module.exports = provider;