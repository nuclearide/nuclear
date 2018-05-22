import * as React from 'react';
import { Divider, Button, Spin, Icon, Row, Col, Tabs } from "antd";
import * as path from "path";
import { Nuclear } from "../../Nuclear";
import * as ts from "typescript";
import { readFileSync, writeFileSync } from "fs";
import { delint } from "../../utils/delint";
import { spawn, ChildProcess } from 'child_process';
import { Terminal } from 'xterm';

const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;

export default class Emulator extends React.Component {

    term: Terminal;
    c: ChildProcess;

    state = {
        path: '',
        loading: false
    }

    componentDidMount() {
        this.term = new Terminal();
        this.term.open(document.getElementById('terminal'));
        this.term.write("Building\n");

        Nuclear.Editor.on('focus', (file) => {
            this.openPreview(file);
        });
        Nuclear.Editor.on('open', (file) => {
            this.openPreview(file);
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
    }

    async loadFile(file) {
        console.log('file', file)
        // this.renderFileComponent(file[0]);
        // const bundle = await this.loadFileWithParcel(file[0]);
        await this.setState({ path: file });
        const delinted = await this.delintViaTs(file);
        console.log('delinted', delinted)
        if (delinted.classNames.length) {
            console.log('will use classnames', delinted.classNames);
        }
        const classN = delinted.classNames[0]
        // Instead of rendered there should be <${classN} /> (with props probably)
        // But it anyway doesnt render because of es6 imports failed, needs to be solved
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

        this.c = spawn(path.resolve(Nuclear.getProjectRoot(), "node_modules/.bin/parcel"), ["index.html", "--port", "8998"], { cwd: path.join(Nuclear.getProjectRoot(), "preview") });
        this.c.stdout.on('data', (d) => {
            this.term.write(d.toString());
            if (d.toString().indexOf("✨") > -1) {
                this.setState({ loading: false });
                w.reload();
            } else if (d.toString().indexOf("⏳") > -1) {
                this.setState({ loading: true });
            }
        });
        // loads new window with preview.html, which contains our template with code
        // its good for first time, probably we do not even need webview
        const w = document.querySelector('#previews');
        // w.getWebContents().openDevTools();
        w.src = 'http://localhost:8998';
    }

    delintViaTs = (path) => {
        // Parse a file
        let sourceFile = ts.createSourceFile(path, readFileSync(path).toString(), ts.ScriptTarget.ES2015, /*setParentNodes */ true);

        // delint it
        return delint(sourceFile);
    };

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
                            <Row>
                                <Col>
                                    <Icon onClick={this.reloadContainer} type="reload" />
                                </Col>
                            </Row>
                            <webview id={'previews'} style={{ height: '100%' }}></webview>
                        </Spin>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Console" key="2" forceRender={true}>
                        <div id="terminal"></div>
                    </Tabs.TabPane>
                </Tabs>
            </div>
        )
    }

    componentWillUnmount() {
        this.c && this.c.kill();
        this.term && this.term.destroy();
    }
}