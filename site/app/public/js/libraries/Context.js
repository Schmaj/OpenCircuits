class Context {
    constructor(designer) {
        this.uidmanager = new UIDManager(this);
        this.designer = designer;
    }
    reset() {
        this.designer.reset();
    }
    render() {
        this.designer.render();
    }
    propogate(sender, receiver, signal) {
        this.designer.propogate(sender, receiver, signal);
    }
    add(o) {
        if (o instanceof Wire)
            this.addWire(o);
        else
            this.addObject(o);
    }
    addObject(o) {
        this.designer.addObject(o);
        this.uidmanager.giveUIDTo(o);
    }
    addObjects(arr) {
        for (var i = 0; i < arr.length; i++)
            this.addObject(arr[i]);
    }
    addWire(w) {
        this.designer.addWire(w);
        this.uidmanager.giveUIDTo(w);
    }
    addWires(arr) {
        for (var i = 0; i < arr.length; i++)
            this.addWire(arr[i]);
    }
    addAction(action) {
        this.designer.history.add(action);
    }
    setCursor(cursor) {
        this.designer.renderer.setCursor(cursor);
    }
    remove(o) {
        var index = this.getIndexOf(o);
        if (index === -1)
            return;
        if (o instanceof Wire)
            this.designer.getWires().splice(index, 1);
        else
            this.designer.getObjects().splice(index, 1);
    }
    undo() {
        this.designer.history.undo();
    }
    redo() {
        this.designer.history.redo();
    }
    redistributeUIDs() {
        this.uidmanager.redistribute();
    }
    getDesigner() {
        return this.designer;
    }
    getRenderer() {
        return this.designer.renderer;
    }
    getCamera() {
        return this.designer.camera;
    }
    getHistoryManager() {
        return this.designer.history;
    }
    getObjects() {
        // Copy to avoid confusing bugs when
        // modifying the objects through add/remove
        // and have it edit the returned array
        return CopyArray(this.designer.objects);
    }
    getWires() {
        // Copy to avoid confusing bugs when
        // modifying the objects through add/remove
        // and have it edit the returned array
        return CopyArray(this.designer.wires);
    }
    getIndexOf(o) {
        if (o instanceof Wire)
            return this.designer.getIndexOfWire(o);
        else
            return this.designer.getIndexOfObject(o);
    }
    findByUID(uid) {
        return FindObjectByUID(uid) || FindWireByUID(uid);
    }
    findObjectByUID(uid) {
        return UIDManager.find(this.getObjects(), uid);
    }
    findWireByUID(uid) {
        return UIDManager.find(this.getWires(), uid);
    }
}

var CurrentContext;
function getCurrentContext() {
    return CurrentContext;
}
function setCurrentContext(context) {
    CurrentContext = context;
}
var MainContext;
function getMainContext() {
    return MainContext;
}
function setMainContext(context) {
    MainContext = context;
}
var Saved = true;
function setSaved(val) {
    Saved = val;
}
function isSaved() {
    return Saved;
}
function reset() {
    CurrentContext = MainContext;
    CurrentContext.reset();
}

module.exports = Context;
module.exports.setCurrentContext = setCurrentContext;
module.exports.getCurrentContext = getCurrentContext;
module.exports.setMainContext = setMainContext;
module.exports.getMainContext = getMainContext;
module.exports.setSaved = setSaved;
module.exports.isSaved = isSaved;
module.exports.reset = reset;

// Requirements
var UIDManager = require("./UIDManager");
var Wire       = require("../models/Wire");

var CopyArray       = require("./Utils").CopyArray;
// 