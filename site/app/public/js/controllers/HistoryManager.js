// Requirements
var Y_KEY = require("../libraries/Constants").Y_KEY;
var Z_KEY = require("../libraries/Constants").Z_KEY;

var Input          = require("./Input");
var SelectionTool = require("./tools/SelectionTool");
var SelectionPopup = require("./selectionpopup/SelectionPopup");
var SelectAction   = require("../libraries/actions/SelectAction");
var GroupAction    = require("../libraries/actions/GroupAction");

var render = require("../libraries/RenderUtils").render;
// 

class HistoryManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }
    onKeyDown(code, input) {
        if (Input.getModifierKeyDown()) {
            if (code === Y_KEY || (code === Z_KEY && Input.getShiftKeyDown()))
                this.redo();
            else if (code === Z_KEY)
                this.undo();
        }
    }
    add(action) {
        // Check for empty group action
        if (action instanceof GroupAction &&
            action.actions.length == 0) {
                return;
        }

        // Check for selection and deselection action
        // Added one after another to combine
        if (action instanceof GroupAction &&
            action.actions[0] instanceof SelectAction) {
                var prev = this.undoStack[this.undoStack.length-1];
                if (this.undoStack.length > 0 &&
                    !action.actions[0].flip &&
                    prev instanceof GroupAction &&
                    prev.actions[0] instanceof SelectAction &&
                    prev.actions[0].flip) {
                        var newAction = new GroupAction();
                        newAction.add(action);
                        newAction.add(prev);
                        this.redoStack = [];
                        this.undoStack[this.undoStack.length-1] = newAction;
                        return;
                    }
        }
        this.redoStack = [];
        this.undoStack.push(action);
    }
    undo() {
        if (this.undoStack.length > 0) {
            var action = this.undoStack.pop();
            action.undo();
            this.redoStack.push(action);
            // Update popup's values
            SelectionPopup.update();
            SelectionTool.recalculateMidpoint();
            render();
        }
    }
    redo() {
        if (this.redoStack.length > 0) {
            var action = this.redoStack.pop();
            action.redo();
            this.undoStack.push(action);
            // Update popup's values
            SelectionPopup.update();
            SelectionTool.recalculateMidpoint();
            render();
        }
    }
}

module.exports = HistoryManager;
