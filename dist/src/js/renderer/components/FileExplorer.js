"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semantic_ui_react_1 = require("semantic-ui-react");
const React = require("react");
const fs_1 = require("fs");
const path_1 = require("path");
const ReactIDE_1 = require("../../ReactIDE");
class Directory extends React.Component {
    constructor(props) {
        super(props);
        this.state = { files: [], open: [] };
    }
    render() {
        return (React.createElement(semantic_ui_react_1.List, null,
            this.state.files.map((file, key) => {
                return (React.createElement(semantic_ui_react_1.List.Item, { key: key },
                    React.createElement(semantic_ui_react_1.List.Content, { floated: "left", onClick: this.onClick.bind(this, file, key), className: "entry" },
                        file.type == 'dir' && React.createElement(semantic_ui_react_1.Icon, { name: this.state.open.indexOf(key) > -1 ? 'caret down' : 'caret right' }),
                        file.type == 'file' && React.createElement(semantic_ui_react_1.Icon, { name: 'file' }),
                        file.name),
                    React.createElement(semantic_ui_react_1.List.Content, { style: { paddingLeft: 10 } }, this.state.open.indexOf(key) > -1 && React.createElement(Directory, { path: file.path }))));
            }),
            this.state.files.length == 0 &&
                React.createElement(semantic_ui_react_1.List.Item, null, "No Items")));
    }
    onClick(file, key) {
        if (file.type === 'dir') {
            this.toggleFolder(key);
        }
        else {
            ReactIDE_1.ReactIDE.Editor.open(file.path);
        }
    }
    toggleFolder(index) {
        var open = this.state.open;
        var i = open.indexOf(index);
        if (i > -1) {
            open.splice(i, 1);
        }
        else {
            open.push(index);
        }
        console.log(open);
        this.setState({ open });
    }
    componentDidMount() {
        fs_1.readdir(this.props.path, (err, files) => {
            this.setState({
                files: files.map((file) => {
                    return {
                        name: file,
                        path: path_1.join(this.props.path, file),
                        type: fs_1.statSync(path_1.join(this.props.path, file)).isDirectory() ? 'dir' : 'file'
                    };
                })
            });
        });
    }
}
var debounce = function (func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate)
                func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow)
            func.apply(context, args);
    };
};
class FileExplorer extends React.Component {
    render() {
        return (React.createElement(Directory, { path: "." }));
    }
    componentDidMount() {
        var onChange = debounce((type, file) => {
            ReactIDE_1.ReactIDE.Editor.externalChange(type, file);
        }, 1000);
        this.watch = fs_1.watch('.', { recursive: true }, onChange);
    }
    componentWillUnmount() {
        this.watch.close();
    }
}
exports.default = FileExplorer;
