import * as React from "react";
import 'codemirror/addon/selection/active-line';
import { EditorConfiguration, fromTextArea } from "codemirror";
import { ReactIDE } from "../ReactIDE";
import { readFile, writeFileSync } from "fs";

for (var mode of ['javascript', 'xml', 'jsx', 'css']) {
    require('codemirror/mode/' + mode + '/' + mode);
}

export class Editor extends React.Component<{ filePath: string, active: boolean }, any> {
    private _editorElement: HTMLTextAreaElement;
    private isSaving = false;

    render() {
        return (
            <textarea ref={e => this._editorElement = e} style={{ height: '80%' }}></textarea>
        );
    }

    componentDidMount() {
        var c = fromTextArea(this._editorElement, {
            lineNumbers: true,
            mode: "text/typescript-jsx",
            styleActiveLine: true
        } as EditorConfiguration);
        c.setSize("100%", "100%");
        
        readFile(this.props.filePath, 'utf8', (error, file) => {
            c.setValue(file);
        });
        ReactIDE.Editor.on('save', () => {
            this.isSaving = true;
            writeFileSync(this.props.filePath, c.getValue());
            setTimeout(() => {
                this.isSaving = false;
            }, 1000);
        });
        ReactIDE.Editor.on('externalChange', (type, filePath) => {
            console.log(this.isSaving);
            if (filePath == this.props.filePath && !this.isSaving) {
                if (confirm('The file has changed, load changes?')) {
                    readFile(this.props.filePath, 'utf8', (error, file) => {
                        c.setValue(file);
                    });
                }
            }
        })
    }
}