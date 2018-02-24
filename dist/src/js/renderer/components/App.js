"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const semantic_ui_react_1 = require("semantic-ui-react");
const FileExplorer_1 = require("./FileExplorer");
const TabBar_1 = require("./TabBar");
const Emulator_1 = require("./Emulator");
class App extends React.Component {
    render() {
        return (React.createElement(semantic_ui_react_1.Grid, { id: "main-grid", padded: true },
            React.createElement(semantic_ui_react_1.Grid.Column, { width: 3, className: "panel" },
                React.createElement(FileExplorer_1.default, null)),
            React.createElement(semantic_ui_react_1.Grid.Column, { width: 10, className: "panel" },
                React.createElement(TabBar_1.default, null),
                React.createElement(Emulator_1.default, null)),
            React.createElement(semantic_ui_react_1.Grid.Column, { width: 3, className: "panel" }, "Settings")));
    }
}
exports.default = App;
