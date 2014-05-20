'use strict';

var MERGE_FIELD_FILTER = ['_id', '__v'];
var MERGE_IDENTIFIER_DEFAULT = '_id';

var mergeArray = function(self, path, values, opts) {
    var schema = self.schema.path(path);
    var field = MERGE_IDENTIFIER_DEFAULT || schema.options.mergeidentifier;
    var oldValues = getValue(self, path);
    
    values.forEach(function(value){
        var set = false;
        
        oldValues.forEach(function(oldValue, oldIndex){
            if(field in value && field in oldValue &&
               oldValue[field].toString() === value[field].toString()) {
                merge.call(self[path][oldIndex], value, opts);
                set = true;
            }
        });
        
        if(!set) oldValues.push(value);
    });
};

var merge = function(obj, opts) {
    var self = this;
    var schema = self.schema;
    opts = opts || {};
    var restriction = opts.fields && !(/(^| |\+)[^ +-]+/g.test(opts.fields));
    self.schema.eachPath(function(path, pathOptions) {
        if (MERGE_FIELD_FILTER.indexOf(path) === -1 &&
                isMergeable(schema, path, opts, restriction)) {
            
            var override = pathOptions.options.mergeoverride !== undefined ? pathOptions.options.mergeoverride : true;
            var value = getValue(obj, path) || obj[path];
            
            if (value !== undefined) {
                if (!override && Array.isArray(value) && value[0] && typeof value[0] === "object") {
                    mergeArray(self, path, value, opts);
                } else if(!override && Array.isArray(value)){
                    self[path].addToSet(value);
                } else {
                    self.set(path, value);
                }
            }
        }
    });
    if (opts.virtuals) {
        Object.keys(self.schema.virtuals).forEach(function (path) {
            var value = getValue(obj, path);
            if (value !== undefined) self.set(path, value);
        });
    }
    return this;
};

module.exports = function(schema, options) {
    schema.method('merge', merge);
};

function getValue(obj, path) {
    if (obj[path] !== undefined) return obj[path];
    var index = path.indexOf('.');
    var base = index !== -1 ? path.substring(0, index) : '';
    var field = path.substring(base.length + 1);
    var value = null;
    while (base && base.length > 0) {
        if (obj[base]) {
            value = getValue(obj[base], field);
            if (value !== undefined) return value;
        }
        index = field.indexOf('.');
        base = index !== -1 ? base + field.substring(0, index) : '';
        field = field.substring(base.length + 1);
    }
    return undefined;
}

function isMergeable(schema, path, opts, restriction) {
    if (opts.fields !== undefined) {
        if ('string' === typeof opts.fields) {
            var index = opts.fields.search(
            new RegExp("(^| |\\-|\\+)"+path.replace('\.', '\\.')+"( |$)"));
            var match = RegExp.$1;
            if (index !== -1) {
                if (match === '+') return true;
                if (match === '-') return false;
                var field = schema.path(path);
                if (field && field.options.mergeable === false) return false;
                return true;
            } if (restriction) return true;
            return false;
        }
    }
    var field = schema.path(path);
    if (field && field.options.mergeable === false) return false;
    return true;
}
