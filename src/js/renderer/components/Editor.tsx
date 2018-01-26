import * as React from "react";
import 'codemirror/addon/selection/active-line';
import { EditorConfiguration, fromTextArea } from "codemirror";
import { ReactIDE } from "../ReactIDE";
import { readFile } from "fs";

for(var mode of ['javascript', 'xml', 'jsx']) {
    require('codemirror/mode/'+mode+'/'+mode);
}

export class Editor extends React.Component {
    private _editorElement: HTMLTextAreaElement;

    render() {
        return (
            <textarea ref={e => this._editorElement=e} style={{height: '80%'}}></textarea>
        );
    }

    componentDidMount() {
        var c = fromTextArea(this._editorElement, {
            lineNumbers: true,
            mode: "jsx",
            value: "function test() {}",
            styleActiveLine: true
        } as EditorConfiguration);
        c.setSize("100%", "100%");
        ReactIDE.Editor.on('open', (filePath) => {
            readFile(filePath, 'utf8', (error, file) => {
                c.setValue(file);
            });
        })
    }
}