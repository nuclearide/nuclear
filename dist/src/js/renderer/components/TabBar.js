"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const semantic_ui_react_1 = require("semantic-ui-react");
const ReactIDE_1 = require("../../ReactIDE");
const Editors_1 = require("./Editors");
class TabBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            changed: [],
            active: ''
        };
    }
    render() {
        return (React.createElement("div", { className: "panel-column" },
            React.createElement("div", { style: { display: this.state.files.length > 0 ? 'block' : 'none' } },
                React.createElement("div", { className: "ui top attached tabular menu" }, this.state.files.map((file, key) => React.createElement("div", { key: key, className: "item" + (this.state.active == file ? ' active' : ' inverted'), onClick: () => { this.select(file); } },
                    file,
                    React.createElement(semantic_ui_react_1.Icon, { name: "asterisk", style: { display: ~this.state.changed.indexOf(key) ? 'inline-block' : 'none' } }),
                    React.createElement(semantic_ui_react_1.Icon, { name: "close", onClick: this.close.bind(this, file) })))),
                React.createElement("div", { className: "ui bottom attached active tab segment" },
                    React.createElement(Editors_1.Editors, null))),
            React.createElement("h1", { style: { display: this.state.files.length == 0 ? 'block' : 'none' } }, "Welcome to ReactIDE")));
    }
    select(file) {
        this.setState({ active: file });
        ReactIDE_1.ReactIDE.Editor.focus(file);
    }
    componentDidMount() {
        ReactIDE_1.ReactIDE.Editor.on('open', (filePath) => {
            var files = this.state.files;
            files.push(filePath);
            this.setState({ files, active: files[files.length - 1] });
        });
        ReactIDE_1.ReactIDE.Editor.on('close', (file) => {
            if (!file) {
                this.close(this.state.active);
            }
        });
    }
    close(file, e) {
        e && e.stopPropagation();
        var { active, files, changed } = this.state;
        var index = files.indexOf(file);
        if (files.length == 0) {
            ReactIDE_1.ReactIDE.Editor.focus(false);
        }
        else {
            if (index < files.indexOf(active) || index == 0) {
                this.select(files[index + 1]);
                ReactIDE_1.ReactIDE.Editor.close(file);
            }
            else {
                this.select(files[index - 1]);
                ReactIDE_1.ReactIDE.Editor.close(file);
            }
        }
        files.splice(index, 1);
        this.setState({ files });
    }
    onChange(key, isDirty) {
        if (isDirty) {
            if (this.state.changed.indexOf(key) == -1) {
                var changed = this.state.changed;
                changed.push(key);
                this.setState({ changed });
            }
        }
        else {
            var index = this.state.changed.indexOf(key);
            if (index > -1) {
                var changed = this.state.changed;
                changed.splice(index, 1);
                this.setState({ changed });
            }
        }
    }
}
exports.default = TabBar;
