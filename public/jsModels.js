/**
 * Created by ilyin on 25.06.2015.
 */

var Observable = require("./observable");
var Base = require("./base");
var _ = require("underscore");

var GlobalChanges = {};
var key = 1;
genKey = function(){ return key++;};


var depth = 0;
var beginTransaction = function(){
    depth++;
};
var endTransaction = function(){
    depth--;
    if (depth!=0)
        return;

    for (var p in GlobalChanges) {
        var obj = GlobalChanges[p];
        obj.__triggerChanged();
    }
    GlobalChanges = {};
};

var ModelBase = Observable.extend({
    __isModel : true,
    ___init : function(){
        this.children = {};
        this.key= genKey();
        this.isDirty = {};
        this.isChanged = {};
        this.__t = 0;
    },

    onChange : function(prop, handler){
        if (arguments.length>=2)
            this.on("change_" + prop, handler);
        else
            this.on("change", arguments[0]);
    },

    onChanged : function(prop, handler){
        if (arguments.length>=2)
            this.on("changed_" + prop, handler);
        else
            this.on("changed", arguments[0]);
    },

    begin : function(){
        beginTransaction();
        this.__begin();
    },

    end : function() {
        this.__end();
        endTransaction();
    },

    __begin : function() {
        this.__t++;
    },

    __end : function(){
        this.__t--;
        if (this.__t!=0)
            return;

        if (!this.____changed)
            return;

        this.____changed = false;
        if (this.parent) {
            this.parent.begin();
            if (this.parent.__markItemChanged){
                this.parent.__markItemChanged(this.__position);
                this.parent.__triggerItemChange(this.__position);
            }
            else {
                this.parent.__markChanged(this.__parentField);
                this.parent.__triggerOnChange(this.__parentField);
            }
            this.parent.end();
        }
        else{
            GlobalChanges[this.key] = this;
        }
    }
})

var EntityBase = ModelBase.extend({
    constructor : function(cfg){
        this.data = cfg || {};
        this.___init();
    },

    toJson : function(){
        var result = {};
        _.forEach()
        for (var pName in this.propsMeta) {
            var propMeta = this.propsMeta[pName];
            var name = propMeta.propName;
            var val = this[name]();
            if (val && val.toJson)
                val = val.toJson();
            if (val!==undefined && val!==null)
                result[propMeta.jsonName] = val;
        }
        return result;
    },

    __getSimpleVal : function(propMeta){
        var prop = propMeta.jsonName;

        if (propMeta._getter) {
            if (this.isDirty[prop] || this.data[prop]===undefined ){
                delete this.isDirty[prop];
                this.data[prop] = propMeta._getter.call(this);
            }
            return this.data[prop];
        }
        else if (propMeta._defaultValue!==undefined) {
            if (this.data[prop]==undefined)
                return propMeta._defaultValue;
        }
        return this.data[prop];
    },

    __setSimpleVal : function(propMeta, val){
        this.begin();
        var prop = propMeta.jsonName;
        val = propMeta.setter ? propMeta.setter(val) : val;

        if (this.data[prop]!==val) {
            this.__markDirty(propMeta);
            this.data[prop] = val;
            this.__triggerOnChange(propMeta, val);
            this.__markChanged(propMeta);
        }
        this.end();
    },

    __setListVal : function(propMeta, newArr) {
        this.begin();
        var list = this.__getListVal(propMeta);
        list.__update(newArr);
        this.end();
    },

    __getListVal : function(propMeta) {
        var propName = propMeta.jsonName;
        var child = this.children[propName];
        if (!child){
            var childData = this.data[propName];
            if (!childData) {
                this.data[propName] = childData = [];
            }
            child = childData;
            for (var func in ListProto)
                if (ListProto.hasOwnProperty(func))
                    child[func] = ListProto[func];
            child.itemType = propMeta.itemType;
            child.___init();
            child.parent = this;
            child.__parentField = propMeta;
            child.updateItems();
            this.children[propName] = child;
        }
        return child;
    },

    __getObjVal : function(propMeta){
        var propName = propMeta.jsonName;
        var child = this.children[propName];
        if (!child){
            var childData = this.data[propName];
            if (!childData)
                this.data[propName] = childData = {};

            child = new propMeta.entityType(childData);
            child.parent = this;
            child.__parentField = propMeta;
            this.children[propName] = child;
        }
        return child;
    },

    __setObjVal : function(propMeta, newVals){
        this.begin();
        var child = this.__getObjVal(propMeta);
        child.__update(newVals);
        this.end();
    },

    update : function(newVals) {
        this.begin();
        this.__update(newVals);
        this.end();
    },

    __update : function(newVals){

        for (var field in newVals) {
            var func = this.funcFor(field);
            if (func)
                func.call(this, newVals[field]);
        }
        for (var d in this.data) {
            if (newVals[d]===undefined)
            {
                var func = this.funcFor(d);
                if (func)
                    func.call(this, null);
            }
        }
    },

    __markDirty : function(propMeta){
        var propName = propMeta.propName;
        this.isDirty[propName] = true;
        for (var p in propMeta._mustUpdate) {
            this.isDirty[p] = true;
        }
        if (this.parent){
            if (this.parent.__markDirty)
                this.parent.__markDirty(this.__parentField);
            else  if (this.parent.__itemDirty)
                this.parent.__itemDirty(this);
        }
    },

    __triggerOnChange : function(propMeta, newVal){
        propMeta.tiggerOnChange(this, newVal);
        this.trigger("change_" + propMeta.propName, newVal);
        this.trigger("change", newVal);
    },

    __markChanged : function(propMeta){
        this.isChanged[propMeta.propName] = true;
        //for (var p in propMeta.dependencyNames) {
        //    this.isChanged[p] = true;
        //}
        this.____changed = true;
    },

    __triggerChanged : function(){

        for (var prop in this.isChanged) {
            var newVal = this[prop].call(this);
            this.trigger("changed_" + prop, newVal);
            this.trigger("changed");

            if (newVal && newVal.__triggerChanged)
                newVal.__triggerChanged.call(newVal);
        }
        this.isChanged = {};
    },

    __getPosition : function(){
        return this.__position;
    }
});

var ListProto = _.extend({}, ModelBase.prototype, {
    wrap : function(item) {
        var wrap = item.__isModel ? item : new this.itemType(item) ;
        if (!wrap.parent)
            wrap.parent = this;
        else if (wrap.parent!=this)
            throw "Item is laready in use";
        return wrap;
    },

    toJson : function(){
        return _.map(this, function(x){return x.toJson()});
    },

    __itemDirty : function(item){
        this.isDirty[item.__position] = true;
    },

    get : function(i)
    {
        return this[i];
    },

    push : function(item) {
        return this.__updateFunc(function(){
            item = this.wrap(item);
            var newLength = Array.prototype.push.call(this, item);
            item.__position = newLength-1;
            return newLength;
        }, arguments, true);
    },

    __triggerItemChange : function(index) {
        this.isChanged[index] = true;
        this.trigger("change");
    },

    __markItemChanged : function(index) {
        this.____changed = true;
        this.isChanged[index] = true;
    },

    pop : function(){
        var result = Array.prototype.pop.apply(this, arguments);
        return result;
    },

    reverse : function(){
        return this.__updateFunc(function() {
            return  Array.prototype.reverse.apply(this, arguments);
        }, arguments, true);
    },

    shift : function(){
        return this.__updateFunc(function() {
            return  Array.prototype.shift.apply(this, arguments);
        }, arguments, true);

    },
    slice : function(){
        var result = Array.prototype.slice.apply(this, args);
        return result;
    },

    sort : function(){
        return this.__updateFunc(function() {
            return  Array.prototype.sort.apply(this, arguments);
        }, arguments, true);
    },

    splice : function(){
        return this.__updateFunc(function() {
            return  Array.prototype.splice.apply(this, arguments);
        }, arguments, true);
    },

    unshift : function(){
        return this.__updateFunc(function() {
            return Array.prototype.unshift.apply(this, arguments);
        }, arguments, true);
    },

    updateItems : function(){
        for (var i=0;i<this.length;i++) {
            this[i] = this.wrap(this[i]);
            this[i].__position = i;
        }
    },

    __updateFunc : function(func, args, update) {
        this.begin();
        var result = func.apply(this, args);
        if (update)
            this.updateItems();
        this.trigger("change", this);
        this.____changed = true;
        this.end();
        return result;
    },

    __update : function(items){
        this.__updateFunc(function(){
            var args = items.concat([]);
            args.unshift(0, this.length);
            this.splice.apply(this, args);
        });
    },

    __triggerChanged : function(){
        for (var prop in this.isChanged) {
            var newVal = this[prop];
            if (newVal && newVal.__triggerChanged)
                newVal.__triggerChanged.call(newVal);
        }
        this.trigger("changed");
        this.isChanged = {};
    }
});




var FieldDefinition = Base.extend({
    constructor : function(cfg){
        this.base(cfg);
        this.onChangeHandlers = [];
        this._dep = [];
        this._mustUpdate = [];
    },
    onChange : function(handler){
        this.onChangeHandlers.push(handler);
        return this;
    },
    dep : function(){
        this._dep = this._dep.concat(_.toArray(arguments));
        return this;
    },
    getter : function(func){
        this._getter = func;
        return this;
    },
    jsonField : function(x) {
        this._jsonField = x;
        return this;
    },
    defaultValue : function(x){
        this._defaultValue = x;
        return this;
    }
});

var EntityMeta = Base.extend({
    constructor : function(cfg){
        this.base(cfg);
    }
});

var PropMeta = Base.extend({
    constructor : function(def){
        this.base(def);
        this.jsonName = def._jsonField || def.propName;
    },
    tiggerOnChange : function(context, newVal){
        if (this.onChangeHandlers)
            _.forEach(this.onChangeHandlers, function(h){
                h.call(context, newVal);
            })
    }
});

module.exports = {
    begin : beginTransaction,
    end : endTransaction,
    field : function(){        var def = new FieldDefinition();        return def;   },
    obj : function(entityType){       return new FieldDefinition({entityType :entityType });    },
    list : function(itemType){

        return new FieldDefinition({
            itemType :itemType
        });
    },

    define : function(cfg){
        var entityMeta = new EntityMeta(cfg);
        var propsMeta = {};
        var newPrototype = {};
        var jsonToFuncs = {};

        _.forEach(cfg, function(x,propName){
            var fieldDef = cfg[propName];
            fieldDef.propName = propName;
            var propMeta = new PropMeta(fieldDef);
            propsMeta[propName] = propMeta;

            if (fieldDef.itemType) {
                newPrototype[propName] = function () {
                    if (arguments.length > 0)
                        this.__setListVal(propMeta, arguments[0]);
                    else
                        return this.__getListVal(propMeta);
                }
            }
            else if (fieldDef.entityType) {
                newPrototype[propName] = function () {
                    if (arguments.length > 0)
                        this.__setObjVal(propMeta, arguments[0]);
                    else
                        return this.__getObjVal(propMeta);
                }
            }
            else {
                newPrototype[propName] = function () {
                    if (arguments.length > 0)
                        this.__setSimpleVal(propMeta, arguments[0]);
                    else
                        return this.__getSimpleVal(propMeta);
                }
            }
            jsonToFuncs[propMeta.jsonName] = newPrototype[propName];
        });

        for (var propName in propsMeta) {
            _.forEach(propsMeta[propName]._dep, function(dep){
                propsMeta[dep]._mustUpdate.push(propName);
            })
        }
        newPrototype.propsMeta = propsMeta;
        newPrototype.funcFor = function(x){
            return jsonToFuncs[x];
        };
        var proto = EntityBase.extend(newPrototype);
        return proto;
    }
};