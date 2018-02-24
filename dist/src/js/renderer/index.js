"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_dom_1 = require("react-dom");
const App_1 = require("./components/App");
const ReactIDE_1 = require("../ReactIDE");
const fs_1 = require("fs");
react_dom_1.render(React.createElement(App_1.default, null), document.getElementById('root'));
fs_1.readdir(__dirname + '/../plugins', (err, files) => {
    files.forEach(file => ReactIDE_1.ReactIDE.Plugins.load(file));
});
addEventListener('beforeunload', () => {
    for (var plugin in ReactIDE_1.ReactIDE.Plugins.plugins()) {
        ReactIDE_1.ReactIDE.Plugins.unload(plugin);
    }
});
