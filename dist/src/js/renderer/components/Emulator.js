"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class Emulator extends React.Component {
    render() {
        return (React.createElement("div", { className: "panel-column", style: { display: 'flex', flexDirection: 'column' } },
            React.createElement("webview", { src: "http://localhost:9999", style: { flex: 1 } }),
            " "));
    }
}
exports.default = Emulator;
