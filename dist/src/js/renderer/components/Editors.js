"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
require("codemirror/addon/selection/active-line");
const codemirror_1 = require("codemirror");
const ReactIDE_1 = require("../../ReactIDE");
const fs_1 = require("fs");
const path_1 = require("path");
for (var mode of ['javascript', 'xml', 'jsx', 'css', 'markdown']) {
    require('codemirror/mode/' + mode + '/' + mode);
}
var debounce = function (func, wait, immediate) {
    var timeout;
    return function (...args) {
        var context = this;
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
class Editors extends React.Component {
    constructor(props) {
        super(props);
        this.docs = {};
        this.state = {
            files: [],
            completions: [],
            active: -1,
            completionFocus: 0
        };
    }
    render() {
        return (React.createElement("div", { style: { position: 'relative' } },
            React.createElement("textarea", { ref: e => this._editorElement = e, style: { height: '80%' } }),
            React.createElement("ul", { ref: e => this._completionElement = e, style: { height: 100, width: 'auto', padding: 5, display: this.state.completions.length > 0 ? 'block' : 'none', background: 'gray', position: 'absolute', zIndex: 1000, overflow: 'scroll' } }, this.state.completions.map((completion, key) => React.createElement("li", { key: key, style: { color: this.state.completionFocus == key ? 'white' : 'blue' } }, completion)))));
    }
    componentDidMount() {
        var c = window['cm'] = this._codemirror = codemirror_1.fromTextArea(this._editorElement, {
            lineNumbers: true,
            styleActiveLine: true
        });
        c.setSize("100%", "80%");
        var complete = debounce(this._complete.bind(this), 500);
        var updateFile = debounce(this._updateFile.bind(this), 500);
        // var onChange = debounce(this.props.onChange, 500);
        c.on('change', (e, change) => {
            if (change.origin && change.origin.charAt(0) == '+') {
                // ReactIDE.CompletionProviders.get().change(this.state.files[this.state.active], change.to, change.from, change.text[0]);
                var rect = this._editorElement.nextElementSibling.getBoundingClientRect();
                var cur = c.getDoc().getCursor();
                let { left, top } = c.cursorCoords(true);
                this._completionElement.style.left = (left - rect.left) + 'px';
                this._completionElement.style.top = (top - rect.top) + 'px';
                var token = c.getTokenAt(cur);
                var index = c.getDoc().indexFromPos(cur);
                updateFile(this.state.files[this.state.active], c.getDoc().getValue());
                if (/[a-zA-Z]+/.test(change.text[0])) {
                    complete(cur, token.string);
                }
                else {
                    this.setState({ completions: [] });
                }
            }
        });
        c.on('cursorActivity', () => {
            this.setState({ completions: [] });
        });
        c.on('scroll', (e) => {
            var rect = this._editorElement.nextElementSibling.getBoundingClientRect();
            let { left, top } = c.cursorCoords(true);
            this._completionElement.style.top = (top - rect.top) + 'px';
        });
        c.setOption("extraKeys", {
            "Up": () => {
                if (this.state.completions.length == 0) {
                    return codemirror_1.Pass;
                }
                else {
                    this.setState({ completionFocus: this.state.completionFocus > 0 ? this.state.completionFocus - 1 : 0 });
                }
            },
            "Down": () => {
                if (this.state.completions.length == 0) {
                    return codemirror_1.Pass;
                }
                else {
                    this.setState({ completionFocus: this.state.completionFocus < this.state.completions.length - 1 ? this.state.completionFocus + 1 : this.state.completions.length - 1 });
                }
            },
            "Enter": () => {
                if (this.state.completions.length == 0) {
                    return codemirror_1.Pass;
                }
                else {
                    var d = c.getDoc();
                    var line = d.getCursor().line;
                    var pos = c.getTokenAt(d.getCursor());
                    // console.log({linepos.start});
                    d.replaceRange(this.state.completions[this.state.completionFocus], { ch: pos.start, line }, { ch: pos.end, line });
                    this.setState({ completions: [] });
                }
            }
        });
        ReactIDE_1.ReactIDE.Editor.on('open', (file) => {
            var { files, active } = this.state;
            active = files.length;
            files.push(file);
            this.docs[file] = codemirror_1.Doc('', ReactIDE_1.ReactIDE.FileTypes.getForFile(path_1.parse(file).base));
            c.swapDoc(this.docs[file]);
            ReactIDE_1.ReactIDE.CompletionProviders.get().loadFile(file);
            fs_1.readFile(files[active], 'utf8', (error, file) => {
                c.setValue(file);
                c.focus();
            });
            this.setState({ files, active });
        });
        ReactIDE_1.ReactIDE.Editor.on('close', (file) => {
            delete this.docs[file];
        });
        ReactIDE_1.ReactIDE.Editor.on('focus', (filePath) => {
            if (filePath) {
                if (this.docs[filePath]) {
                    c.swapDoc(this.docs[filePath]);
                }
                else {
                    throw new Error("File not found");
                }
            }
            else {
                c.swapDoc(codemirror_1.Doc('', 'text/plain'));
            }
        });
        ReactIDE_1.ReactIDE.Editor.on('save', () => {
            // this.isSaving = true;
            fs_1.writeFileSync(this.state.files[this.state.active], c.getValue());
            // onChange(false);
            // setTimeout(() => {
            //     this.isSaving = false;
            // }, 2000);
        });
        // ReactIDE.Editor.on('externalChange', (type, filePath) => {
        //     console.log(this.isSaving);
        //     if (filePath == this.props.files[this.props.active] && !this.isSaving) {
        //         if (confirm('The file has changed, load changes?')) {
        //             readFile(this.props.files[this.props.active], 'utf8', (error, file) => {
        //                 c.setValue(file);
        //             });
        //         }
        //     }
        // })
    }
    _complete(position, token) {
        ReactIDE_1.ReactIDE.CompletionProviders.get().getAtPosition(position, token, this.state.files[this.state.active], (list) => {
            this.setState({ completions: list, completionFocus: 0 });
        });
    }
    _updateFile(filePath, source) {
        ReactIDE_1.ReactIDE.CompletionProviders.get().updateFile(filePath, source);
    }
}
exports.Editors = Editors;
