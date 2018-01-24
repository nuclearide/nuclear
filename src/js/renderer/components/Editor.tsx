import * as React from "react";
import * as CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/jsx/jsx';

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
        var c = CodeMirror.fromTextArea(this._editorElement, {
            lineNumbers: true,
            mode: "jsx",
            value: "function test() {}"
        });
        c.setSize("100%", "100%");
    }
}