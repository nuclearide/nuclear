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
import { Icon, Row, Col, Button } from 'antd';
import { EditorEvents, Nuclear } from "../lib/Nuclear";
import { parse } from "path";
import { spawn } from "child_process";
import { createInterface } from "readline";
import TSClient from '../../../lib/tsclient';

import * as ts from 'typescript';
import { writeFileSync } from "fs";
import { debounce } from "lodash";
import { createPortal, render } from 'react-dom';
import { ipcRenderer } from 'electron';
import { settingsProvider } from "../providers/SettingsProvider";

var imageTypes = ['.png', '.jpg', '.svg'];

// var tsserver = spawn('./node_modules/.bin/tsserver');
// var i = createInterface(tsserver.stdout);

function Autocomplete(props) {
    return createPortal(
        <div style={{ height: '100px', position: "absolute", zIndex: 5000, background: "#f5f5f5", borderRadius: 5, padding: 5, width: '200px', overflow: "scroll", left: props.left + "px", top: props.top + "px" }}>
            {props.completions.map(({ name }, key) => {
                return <div key={key}>{name}</div>
            })}
        </div>,
        document.body
    )
}
export default class Editor extends React.Component<{ file: string }, { isImage: boolean, filePath: string, errors: any[], completions: any[], pos: number[] }> {
    private codemirrorDiv: HTMLElement;
    private c: CodeMirror.Editor;
    private completionDiv: HTMLDivElement;
    constructor(props) {
        super(props);
        this.state = {
            isImage: false,
            filePath: '',
            errors: [],
            completions: [],
            pos: []
        }
    }
    render() {
        return (
            <div style={{ height: "calc(50% - 40px)" }}>
                {this.state.completions.length > 0 && <Autocomplete completions={this.state.completions} left={this.state.pos[0]} top={this.state.pos[1]} />}
                <div style={{ display: this.state.isImage ? "none" : "block", height: 'calc(100% - 100px)', width: '100%' }} ref={codemirrorDiv => this.codemirrorDiv = codemirrorDiv} />
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
        if (module.hot) {
            module.hot.dispose(function () {
                tsclient.close();
            });
            module.hot.accept(function () {
                tsclient = new TSClient({
                    cwd: Nuclear.getProjectRoot()
                })
            });
        }
        var tsclient = new TSClient({
            cwd: Nuclear.getProjectRoot()
        })
        this.c = CodeMirror(this.codemirrorDiv, {
            lineNumbers: true,
            theme: "vibrancy",
            mode: "text/typescript-jsx",
            keyMap: "sublime",
            gutters: ["CodeMirror-lint-markers"]
        });
        this.c.setOption('lint', { lintOnChange: false });
        CodeMirror.registerHelper("lint", "javascript", () => {
            return syntaxErrors.concat(semanticErrors);
        });

        settingsProvider.on('change', () => {
            this.c.setOption("theme", settingsProvider.get("theme"));
        })

        this.c.setSize('100%', '100%');
        tsclient.open(this.props.file);
        var syntaxErrors = [];
        var semanticErrors = [];
        var syntaxErrorWidgets = [];
        tsclient.on('syntaxDiag', (errs) => {
            syntaxErrorWidgets.forEach(widget => widget.clear());
            errs.diagnostics.forEach((diagnostic) => {
                var el = <div className="inline-error">{diagnostic.text}<Button style={{ float: 'right' }} size="small" type="primary">fix</Button></div>;
                var div = document.createElement('div');
                div.style.height = "36px";
                div.style.margin = "2px";
                render(el, div);
                syntaxErrorWidgets.push(this.c.addLineWidget(diagnostic.start.line - 1, div));
            })
            var errors = errs.diagnostics.map((diagnostic) => {
                return {
                    from: CodeMirror.Pos(diagnostic.start.line - 1, diagnostic.start.offset - 1),
                    to: CodeMirror.Pos(diagnostic.end.line - 1, diagnostic.end.offset - 1),
                    message: diagnostic.text
                }
            });
            syntaxErrors = errors;
            this.c["performLint"]();
        });
        var semanticErrorWidgets = [];
        tsclient.on("semanticDiag", (errs) => {
            semanticErrorWidgets.forEach(widget => widget.clear());

            errs.diagnostics.forEach((diagnostic) => {
                var el = <div className="inline-error">{diagnostic.text}<Button style={{ float: 'right' }} size="small" type="primary">fix</Button></div>;
                var div = document.createElement('div');
                div.style.height = "36px";
                div.style.margin = "2px";
                render(el, div);
                semanticErrorWidgets.push(this.c.addLineWidget(diagnostic.start.line - 1, div));
            })
            var errors = errs.diagnostics.map((diagnostic) => {
                return {
                    from: CodeMirror.Pos(diagnostic.start.line - 1, diagnostic.start.offset - 1),
                    to: CodeMirror.Pos(diagnostic.end.line - 1, diagnostic.end.offset - 1),
                    message: diagnostic.text,
                    type: "semantic"
                }
            })
            semanticErrors = errors;
            this.c["performLint"]();
        });

        var getCompletions = debounce(async (line, offset) => {
            let prefix = this.c.getTokenAt(CodeMirror.Pos(line, offset + 1)).string;
            // console.log(prefix);
            var res = await tsclient.getCompletions(this.props.file, line + 1, offset + 1, prefix && prefix == "." ? undefined : prefix);
            var results = res.body;
            // console.log(await tsclient.getDefinition(this.props.file, 6, 22));
            // console.log(results);
            this.setState({ completions: results });
        }, 200);
        var getErr = debounce(() => {
            tsclient.getErr(this.props.file);
        }, 200);
        this.c.on('change', async (e, change) => {
            if (change.origin == "setValue") { return; }
            if (change.origin == "+delete" || /^[a-z]$/i.test(change.text[0])) {
                var { line, ch } = this.c.getDoc().getCursor();
                var { left, top } = this.c.cursorCoords(false);
                this.setState({ pos: [left, top + 20] }, () => getCompletions(line, ch));
            }
            tsclient.change(this.props.file, change.from.line + 1, change.from.ch + 1, change.to.line + 1, change.to.ch + 1, change.text.join("\n"));
            getErr();
        })

        this.c.on('mousedown', () => {
            this.setState({ completions: [] });
        });

        this.c.on('keydown', (cm, e) => {
            if (e.ctrlKey && e.keyCode == 32) {
                var { line, ch } = this.c.getDoc().getCursor();
                var { left, top } = this.c.cursorCoords(false);
                this.setState({ pos: [left, top + 20] }, () => getCompletions(line, ch));
            }
            //     if (~[37, 38, 39, 40].indexOf(e.keyCode)) {
            //         this.setState({ completions: [] });
            //     }
        })

        if (~imageTypes.indexOf(parse(this.props.file).ext)) {
            this.setState({ isImage: true, filePath: this.props.file });
        } else {
            this.c.setValue(fs.readFileSync(this.props.file, 'utf8'));
            // sendMessage("open", { file: this.props.file });
            this.setState({ isImage: false, filePath: this.props.file });
        }

        ipcRenderer.on('save', () => {
            console.log('saving', this.state.filePath);
            writeFileSync(this.state.filePath, this.c.getValue());
            EditorEvents.emit('save', this.state.filePath);
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
                // sendMessage("open", { file: this.props.file });
                this.setState({ isImage: false, filePath: props.file });
                // this.setState({loading: false});
            }
        }
    }
}