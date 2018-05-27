import * as React from 'react';
import { Divider, Button, Spin, Icon, Row, Col, Tabs } from "antd";
import * as path from "path";
import { Nuclear } from "../../Nuclear";
import * as ts from "typescript";
import { readFileSync, writeFileSync } from "fs";
import { delint } from "../../utils/delint";
import { spawn } from 'node-pty';
import { EventEmitter } from 'events';
import { ITerminal } from 'node-pty/lib/interfaces';
import { Terminal } from 'xterm';
import List from "antd/lib/list";

const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;

export default class Emulator extends React.Component {

    terminalContainer: HTMLDivElement;
    term: Terminal;
    c: ITerminal;
    w: Electron.webContents;

    state = {
        path: '',
        loading: false,
        availableClasses: [],
        previewLogs: [],
        noDefaultClass: false,
    }
    toggleWebViewDevTools = () => {
        if (!this.w) {
            return;
        }
        if (this.w.isDevToolsOpened()) {
            return this.w.closeDevTools();
        }
        return this.w.openDevTools();
    };

    componentDidMount() {
        this.term = new Terminal();
        this.term.open(this.terminalContainer);
        this.term.write("Building\n");

        Nuclear.Editor.on('focus', (file) => {
            this.openPreview(file);
        });
        Nuclear.Editor.on('open', (file) => {
            this.openPreview(file);
        });
        Nuclear.Editor.on('save', (file) => {
            this.loadFile(file);
        });
    }
    openPreview(file) {
        var exts = [".tsx", ".js", ".jsx"];
        if (~exts.indexOf(path.parse(file).ext)) {
            this.loadFile(file);
        }
    }

    reloadContainer = () => {
        const webview = document.querySelector('webview');
        webview.reload();
        this.setState({ previewLogs: [] })
    }

    async lintFile(file = this.state.path) {
        if (!file) {
            console.log('no valid file passed');
            return;
        }
        const delinted = await this.delintViaTs(file);
        let availableClasses = [];
        // Used for detecting if no default class present
        // If yes, try to render first class of classnames
        // if even that doesn't help - prompt to user.
        let noDefaultClass = false;
        if (delinted.defaultExport) {
            availableClasses = [delinted.defaultExport + '.default']
                .concat(delinted.classNames.filter(c => c !== delinted.defaultExport));
        } else {
            availableClasses = delinted.classNames.filter(c => c.length);
            noDefaultClass = true;
        }
        await this.setState({ availableClasses, noDefaultClass });
    }

    async loadFile(file) {
        console.log('file', file)
        // this.renderFileComponent(file[0]);
        // const bundle = await this.loadFileWithParcel(file[0]);
        await this.setState({ path: file, previewLogs: [] });
        await this.lintFile(file);
        const template = `
            var React = require('react');
            var ImportedComponent = require('../${path.relative(Nuclear.getProjectRoot(), file)}');
            var render = require('react-dom').render;
            render(<ImportedComponent.default/>, document.getElementById("root"));
            
            `
        writeFileSync(path.resolve(Nuclear.getProjectRoot(), 'preview/PreviewComponent.tsx'), template)
        writeFileSync(path.resolve(Nuclear.getProjectRoot(), 'preview/index.html'), `
                <body>
                    <div id="root"></div>
                    <script src="PreviewComponent.tsx"></script>
                </body>
            `);

        this.c = spawn(
            path.resolve(Nuclear.getProjectRoot(), "node_modules/.bin/parcel"),
            ["index.html", "--port", "8998"],
            {
                cwd: path.join(Nuclear.getProjectRoot(), "preview"),
                cols: this.term.cols,
                rows: this.term.rows
            });
        this.c.on('data', (d) => {
            this.term.emit("data", d);
            if (d.toString().indexOf("✨") > -1) {
                this.setState({ loading: false });
                this.w.reload();
            } else if (d.toString().indexOf("⏳") > -1) {
                this.setState({ loading: true });
            }
        });
        // loads new window with preview.html, which contains our template with code
        // its good for first time, probably we do not even need webview
        this.w = document.querySelector('#previews');
        // w.getWebContents().openDevTools();
        this.w.src = 'http://localhost:8998';
        this.w.addEventListener('console-message', (e) => {
            console.log('Guest page logged a message:', e.message, e)
            this.setState({ previewLogs: [...this.state.previewLogs, e] })
        })
    }

    delintViaTs = (path) => {
        // Parse a file
        let sourceFile = ts.createSourceFile(path, readFileSync(path).toString(), ts.ScriptTarget.ES2015, /*setParentNodes */ true);

        // delint it
        return delint(sourceFile);
    };

    renderLogMessage = (e) => {
        const LogItem = (props: { style?, text, title? }) => {
            return (
                <List.Item
                    style={{
                        paddingLeft: 10,
                        paddingRight: 10,
                        borderRadius: 10,
                        ...props.style
                    }}
                >
                    <List.Item.Meta
                        title={props.title || "Message"}
                        description={props.text}
                    />
                </List.Item>
            )
        }
        switch (e.level) {
            case 1:
                return <LogItem style={{ backgroundColor: "#fff2e8" }} text={e.message} title={"Warning"}/>;
            case 2:
                return <LogItem style={{ backgroundColor: "#f5222d" }} text={e.message} title={"Error"} />;
            default:
                return <LogItem style={{ backgroundColor: "#fafafa" }} text={e.message} />
        }
    }

    render() {
        return (
            <div
                className="panel-column"
                style={{
                    height: 'calc(50% - 40px)'
                }}
            >
                {/* <webview src="http://localhost:9999" style={{flex: 1}}></webview>*/}
                <Tabs tabBarStyle={{ height: "50px" }}>
                    <Tabs.TabPane tab="Preview" key="1" forceRender={true}>
                        <Spin spinning={this.state.loading} indicator={<Icon type="loading" style={{ fontSize: 36 }} spin />}>
                            <Row justify={'end'} type={'flex'} style={{ paddingLeft: 15, paddingRight: 15, marginBottom: 5 }}>
                                <Icon title={'Reload component container'} style={{ width: 50 }} onClick={this.reloadContainer} type="reload" />
                                { this.w && <Icon title={'Toggle container devtools'} style={{ width: 50 }} onClick={this.toggleWebViewDevTools} type="select" /> }
                            </Row>
                            <webview id={'previews'} style={{ height: '100%' }}></webview>
                        </Spin>
                    </Tabs.TabPane>
                    <Tabs.TabPane disabled={Boolean(this.state.loading)} tab="Preview log" key="3" forceRender={true}>
                        <div style={{ padding: 10 }}>
                            <List
                                dataSource={this.state.previewLogs}
                                renderItem={this.renderLogMessage}
                            />
                        </div>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Console" key="2" forceRender={true}>
                        <div ref={terminalContainer => this.terminalContainer = terminalContainer}></div>
                    </Tabs.TabPane>
                </Tabs>
            </div>
        )
    }

    componentWillUnmount() {
        this.c && this.c.kill();
    }
}