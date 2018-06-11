import React from "react";
import FileExplorer from "./FileExplorer";
import TabBar from "./TabBar";
import Emulator from "./Emulator";
import Toolbar from "./Toolbar";
import Terminal from "./Terminal";

import { Layout, Modal } from "antd";
import { readdir, statSync } from "fs";
import { join } from "path";
import { USED_HOTKEYS } from "../utils/constants";
import FileSearchModal from "./FileSearchModal";
import { Nuclear, WindowEvents } from "../lib/Nuclear";
import { settingsProvider, SettingsContext } from "../providers/SettingsProvider";
import { Settings } from "./Settings";
import { AddPropsModal } from "./AddPropsModal";

export default class App extends React.Component<any, any> {

    state = {
        loading: false,
        foundFiles: [],
        showFileSearchModal: false,
        path: '',
        settings: settingsProvider.get(),
        showAddPropsModal: false,
        previewProps: [],
    };

    private toggleState = (newState: object) => this.setState(newState);

    private handleSelectFile = async (path: string) => {
        await this.setState({ showFileSearchModal: false });
        Nuclear.Editor.open(path);
    }

    private findFiles = async (path: string) => {
        await readdir(path, async (err, files) => {
            for (let f of files) {
                if (f == "node_modules" || f == ".git") continue;

                let file = join(path, f);
                if (!statSync(file).isDirectory()) {
                    console.log("found file", f);
                    this.setState({
                        foundFiles: [...this.state.foundFiles, { name: f, path: file }],
                        showFileSearchModal: true
                    });
                    window["PATHS"] = this.state.foundFiles;
                } else {
                    await this.findFiles(file);
                }
            }
        });
    }

    private handleFileSearch = async (path: string) => {
        // reset files list
        await this.setState({ foundFiles: [] });
        this.findFiles(path);
        console.log("found files", this.state.foundFiles, path);
    };
    private closeFileSearch = () => this.setState({ showFileSearchModal: false });

    public toggleFileSearch = (e: KeyboardEvent) => {
        if (e.metaKey && e.shiftKey && e.code === USED_HOTKEYS.O && this.state.path) {
            this.handleFileSearch(this.state.path);
        }
    };

    public applyPropsToPreview = (props: Array<{ name: string, type: string, value: string }>) => {
        this.setState(
            { previewProps: props, showAddPropsModal: false }, 
            () => WindowEvents.emit('addprop')
        )
    }

    componentDidMount() {
        settingsProvider.on('change', () => {
            this.setState({ settings: settingsProvider.get() });
        });
    }

    render() {
        return (
            <SettingsContext.Provider value={this.state.settings}>
                <Layout>
                    {/* <Toolbar/> */}
                    <FileSearchModal
                        onCancel={this.closeFileSearch}
                        visible={this.state.showFileSearchModal}
                        path={this.state.path}
                        foundFiles={this.state.foundFiles}
                        onSelect={this.handleSelectFile}
                    />
                    <AddPropsModal
                        onCancel={() => this.setState({ showAddPropsModal: false })}
                        visible={this.state.showAddPropsModal}
                        onSubmit={this.applyPropsToPreview}
                    />
                    <Layout.Sider width={400}>
                        <br />
                        {this.state.loading ? <h4 style={{ marginLeft: 10 }}>Loading</h4> : null}
                        {/* <progress id="progress"/> */}
                        <FileExplorer
                            path={this.state.path}
                            toggleFileSearch={this.toggleFileSearch}
                            toggleState={this.toggleState}
                            loading={this.state.loading}
                        />
                    </Layout.Sider>
                    <Layout.Content>
                        <TabBar />
                        <Emulator
                            previewProps={this.state.previewProps}
                            openAddPropsModal={() => this.setState({ showAddPropsModal: true })}
                        />
                        {/* <SettingsContext.Consumer>
                            {
                                (val) => {
                                    return <><Settings /><span>{JSON.stringify(val)}</span></>
                                }
                            }
                        </SettingsContext.Consumer> */}
                    </Layout.Content>
                </Layout>
            </SettingsContext.Provider>
        );
    }
}
