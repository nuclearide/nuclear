import React from "react";
import CodeMirror from "codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/xml/xml";
import "codemirror/mode/jsx/jsx";
import "codemirror/mode/css/css";
import "codemirror/mode/markdown/markdown";
import "codemirror/addon/comment/comment";
import "codemirror/addon/lint/lint";
import "codemirror/keymap/sublime";
var fs = require('fs');
import { compile, h } from "../lib/LSHost";
import { Icon, Row, Col } from 'antd';
import { EditorEvents, Nuclear } from "../../Nuclear";
import { parse } from "path";
import { spawn } from "child_process";
import { createInterface } from "readline";

import * as ts from 'typescript';
import { writeFileSync } from "fs";

var imageTypes = ['.png', '.jpg', '.svg'];

var tsserver = spawn('./node_modules/.bin/tsserver');
var i = createInterface(tsserver.stdout);

i.on('line', (line) => {
    if (line[0] == '{') {
        var obj = JSON.parse(line);
        console.log(obj);
        if (obj.event == "syntaxDiag") {
            var errors = obj.body.diagnostics.map((diagnostic) => {
                return {
                    from: CodeMirror.Pos(diagnostic.start.line - 1, diagnostic.start.offset - 1),
                    to: CodeMirror.Pos(diagnostic.end.line - 1, diagnostic.end.offset - 1),
                    message: diagnostic.text
                }
            })
            updateLinting(errors);
        }
    }
});
var updateLinting;
var linter = function (text, u) {
    updateLinting = u
}

var sendMessage = (command, args) => {
    tsserver.stdin.write(JSON.stringify({
        "seq": 1,
        "type": "quickinfo",
        "command": command,
        "arguments": args
    }) + '\n');
}

window.addEventListener('beforeunload', () => {
    console.log("killing");
    tsserver.kill();
})

export default class Editor extends React.Component<{ file: string }, { isImage: boolean, filePath: string, errors: any[] }> {
    private codemirrorDiv: HTMLElement;
    private c: CodeMirror.Editor;
    constructor(props) {
        super(props);
        this.state = {
            isImage: false,
            filePath: '',
            errors: []
        }
    }
    render() {
        return (
            <div style={{ height: "calc(50% - 40px)" }}>
                <div style={{ display: this.state.isImage ? "none" : "block", height: '100%', width: '100%' }} ref={codemirrorDiv => this.codemirrorDiv = codemirrorDiv}>
                </div>
                <div style={{ display: !this.state.isImage ? "none" : "block", height: '100%', width: '100%' }}>
                    <Row type="flex" justify="center" align="middle" style={{ height: '100%' }}>
                        <Col span={6}>
                            {this.state.isImage && <img src={"file://" + this.state.filePath} style={{ width: '100%', height: 'auto' }} />}
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }

    async componentDidMount() {
        this.c = CodeMirror(this.codemirrorDiv, {
            lineNumbers: true,
            theme: "dracula",
            mode: "text/typescript-jsx",
            keyMap: "sublime",
            gutters: ["CodeMirror-lint-markers"]
        });
        this.c.setOption('lint', {
            async: true,
            getAnnotations: linter
        })
        this.c.setSize('100%', '100%');

        if (~imageTypes.indexOf(parse(this.props.file).ext)) {
            this.setState({ isImage: true, filePath: this.props.file });
        } else {
            this.c.setValue(fs.readFileSync(this.props.file, 'utf8'));
            sendMessage("open", { file: this.props.file });
            this.setState({ isImage: false, filePath: this.props.file });
        }

        EditorEvents.on('save', () => {
            console.log('saving');
            writeFileSync(this.state.filePath, this.c.getValue());
        })
        // this.setState({loading: true});
        // var res = await FileSystem.readFile(this.props.file);
        // console.log(res, 1);
        // this.c = CodeMirror(this.codemirrorDiv, {
        //     lineNumbers: true,
        //     theme: "dracula",
        //     mode: res.length < 256000 ? "text/typescript-jsx" : "text/plain",
        //     keyMap: "sublime",
        //     gutters: ["CodeMirror-lint-markers"],
        //     lint: true,
        //     value: res
        // });
        // this.setState({loading: false});

        // var box = this.c.getWrapperElement();
        // box.addEventListener("webkitmouseforcedown", (ev) => {
        //     // console.log(ev, "mouseforcedown");
        //     console.log(this.c.getTokenAt(this.c.getDoc().getCursor()));
        //   });

        //   box.addEventListener("webkitmouseforceup", function(ev) {
        //     console.log(ev, "mouseforceup");
        //   });

        //   box.addEventListener("mouseup", function(ev) {
        //     console.log(ev, "mouseup");
        //   });

        //   box.addEventListener("mousedown", function(ev) {
        //     console.log(ev, "mousedown");
        //   });

        // box.addEventListener("webkitmouseforcewillbegin", function(ev) {
        //     // console.log(ev, "mouseforcewillbegin");
        //     // if not preventing default, force-mousing on text fires Quicklook
        //     ev.preventDefault();
        // });
        // var fileName = this.props.file.split("/").slice(-1)[0];
    }

    componentWillReceiveProps(props) {
        if (props.file) {
            if (~imageTypes.indexOf(parse(props.file).ext)) {
                this.setState({ isImage: true, filePath: props.file });
            } else {
                this.c.setValue(fs.readFileSync(props.file, 'utf8'));
                sendMessage("open", { file: this.props.file });
                this.setState({ isImage: false, filePath: props.file });
                // this.setState({loading: false});
            }
        }
    }
}