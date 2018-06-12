// Requirements
var Wire     = require("../models/Wire");
var WirePort = require("../models/WirePort");
// 

function CopyGroup(objects) {
    if (objects.length === 0)
        return [];

    var copies = [];
    for (var i = 0; i < objects.length; i++) {
        if (objects[i] instanceof WirePort)
            objects.splice(i--, 1);
        else
            copies[i] = objects[i].copy();
    }

    // Copy and reconnect all wires
    var wireCopies = [];
    for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];
        for (var j = 0; j < obj.outputs.length; j++) {
            var wires = obj.outputs[j].connections;
            for (var k = 0; k < wires.length; k++) {
                // See if connection was also copied
                var ww = wires[k];
                while (ww instanceof Wire || ww instanceof WirePort)
                    ww = ww.connection;
                if (FindIPort(objects, ww, copies) == undefined)
                    break;

                var wire = wires[k].copy();
                copies[i].outputs[j].connect(wire);
                var w = wires[k];
                
                // Iterate through all wires connected to other wires
                while(w.connection instanceof WirePort) {
                    var port = new WirePort(obj.context);
                    wire.connect(port);
                    wireCopies.push(wire);
                    w = w.connection.connection;
                    wire = w.copy();
                    port.connect(wire);
                    copies.push(port);
                }
                var lastConnection = FindIPort(objects, w.connection, copies);
                wire.connect(lastConnection);
                wireCopies.push(wire);
            }
        }
    }
    for (var i = 0; i < objects.length; i++) {
        copies[i].isOn = objects[i].isOn;
        if (objects[i].inputs.length === 0)
            copies[i].activate(objects[i].isOn);
    }
    for (var i = 0; i < wireCopies.length; i++) {
        if (objects[i].inputs.length === 0)
            copies[i].activate(objects[i].isOn);
    }

    return {objects:copies, wires:wireCopies};
}

function FindIPort(objects, target, copies) {
    for (var i = 0; i < objects.length; i++) {
        var iports = objects[i].inputs;
        for (var j = 0; j < iports.length; j++) {
            if (iports[j] === target)
                return copies[i].inputs[j];
        }
    }
    return undefined;
}

module.exports.CopyGroup = CopyGroup;
module.exports.FindIPort = FindIPort;