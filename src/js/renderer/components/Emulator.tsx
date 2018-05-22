import * as React from 'react';
import { Divider, Button } from "antd";
import * as path from "path";
import { Nuclear } from "../../Nuclear";
import * as ts from "typescript";
import { readFileSync, writeFileSync } from "fs";
import { delint } from "../../utils/delint";
const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;

export default class Emulator extends React.Component {

    state = {
        path: '',
    }

    reloadContainer = () => {
        const webview = document.querySelector('webview');
        webview.reload();
    }

    loadFile = async () => {
        const file: string[] = require('electron').remote.dialog.showOpenDialog({ properties: ['openFile'] });
        if (file) {
            console.log('file', file)
            // this.renderFileComponent(file[0]);
            // const bundle = await this.loadFileWithParcel(file[0]);
            await this.setState({ path: file[0] });
            const delinted = await this.delintViaTs(file[0]);
            console.log('delinted', delinted)
            if (delinted.classNames.length) {
                console.log('will use classnames', delinted.classNames);
            }
            const classN = delinted.classNames[0]
            // Instead of rendered there should be <${classN} /> (with props probably)
            // But it anyway doesnt render because of es6 imports failed, needs to be solved
            const template = `
            var React = require('react');
            var {${classN}} = require('${file[0]}');
            var render = require('react-dom').render;
            render(<h1>Rendered!</h1>, document.getElementById("root"));
            
            `
            writeFileSync(path.resolve(Nuclear.getProjectRoot(), 'dist/PreviewComponent.tsx'), template)
            console.log('did everythingg');
            // loads new window with preview.html, which contains our template with code
            // its good for first time, probably we do not even need webview
            const w = new BrowserWindow({
                width: 300,
                height: 300,
            })
            w.webContents.openDevTools();
            w.loadURL('http://localhost:1234/dist/preview.html')
        }
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
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    backgroundColor: 'red'
                }}
            >
                {/* <webview src="http://localhost:9999" style={{flex: 1}}></webview>*/}
                <div
                    className={'ant-layout'}
                    style={{
                        paddingTop: 20,
                        height: 'auto'
                    }}
                >
                    <div>
                        <span style={{ marginLeft: 10, fontWeight: 'bold' }}>Preview</span>
                        <button onClick={this.reloadContainer}>Reload</button>
                        <Button onClick={this.loadFile}>Open file outside of the project</Button>
                        <Divider style={{ marginBottom: 10 }} />
                    </div>
                    <div id={'preview-child'} style={{ backgroundColor: 'red' }}>

                    </div>
                    <webview id={'previews'} style={{ height: '100%' }} src={'dist/preview.html'}>
                        <div id={'rootchild'}>

                        </div>
                    </webview>
                </div>
            </div>
        )
    }
}