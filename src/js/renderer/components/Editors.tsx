import * as React from "react";
import 'codemirror/addon/selection/active-line';
import { EditorConfiguration, fromTextArea, Doc } from "codemirror";
import { ReactIDE } from "../../ReactIDE";
import { readFile, writeFileSync } from "fs";
import { parse } from "path";

for (var mode of ['javascript', 'xml', 'jsx', 'css', 'markdown']) {
    require('codemirror/mode/' + mode + '/' + mode);
}

var debounce = function (func, wait, immediate?) {
    var timeout;
    return function (...args) {
        var context = this;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

export class Editors extends React.Component<{}, { files: string[], active: number, completions: any[] }> {
    private _editorElement: HTMLTextAreaElement;
    private _codemirror;
    private isSaving;
    private docs: { [filename: string]: Doc } = {};
    private _completionElement: HTMLUListElement;

    constructor(props) {
        super(props);
        this.state = {
            files: [],
            completions: [],
            active: -1
        }
    }

    render() {
        return (
            <div style={{ position: 'relative' }}>
                <textarea ref={e => this._editorElement = e} style={{ height: '80%' }}></textarea>
                <ul ref={e => this._completionElement = e} style={{ height: 100, width: 'auto', padding: 5, display: this.state.completions.length > 0 ? 'block' : 'none', background: 'gray', position: 'absolute', zIndex: 1000, overflow: 'scroll' }}>
                    {this.state.completions.map((completion, key) => <li key={key}>{completion}</li>)}
                </ul>
            </div>
        );
    }

    componentDidMount() {
        var c = window['cm'] = this._codemirror = fromTextArea(this._editorElement, {
            lineNumbers: true,
            styleActiveLine: true
        } as EditorConfiguration);
        c.setSize("100%", "80%");
        var complete = debounce(this._complete.bind(this), 500);

        // var onChange = debounce(this.props.onChange, 500);

        c.on('cursorActivity', () => {
            // if (event.origin.charAt(0) == '+') {
            //     // onChange(true);
            // }
            var rect = this._editorElement.nextElementSibling.getBoundingClientRect();
            var cur = c.getDoc().getCursor(), token = c.getTokenAt(cur);
            let { left, top } = c.cursorCoords(true);
            var index = c.getDoc().indexFromPos(cur);
            
            this._completionElement.style.left = (left - rect.left) + 'px';
            this._completionElement.style.top = (top - rect.top) + 'px';
            complete(index, token.string);
        })

        ReactIDE.Editor.on('open', (file) => {
            var { files, active } = this.state;
            active = files.length;
            files.push(file);
            this.docs[file] = Doc('', ReactIDE.FileTypes.getForFile(parse(file).base));
            c.swapDoc(this.docs[file]);
            ReactIDE.CompletionProviders.get().loadFile(file);
            readFile(files[active], 'utf8', (error, file) => {
                c.setValue(file);
                c.focus();
            });
            this.setState({ files, active });
        });
        ReactIDE.Editor.on('close', (file) => {
            delete this.docs[file];
        });
        ReactIDE.Editor.on('focus', (filePath) => {
            if (filePath) {
                if (this.docs[filePath]) {
                    c.swapDoc(this.docs[filePath]);
                } else {
                    throw new Error("File not found");
                }
            } else {
                c.swapDoc(Doc('', 'text/plain'));
            }
        });
        ReactIDE.Editor.on('save', () => {
            // this.isSaving = true;
            writeFileSync(this.state.files[this.state.active], c.getValue());
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

    private _complete(index, token) {
        ReactIDE.CompletionProviders.get().getAtPosition(index, token, this.state.files[this.state.active], (list) => {
            this.setState({completions: list});
        });
    }
}