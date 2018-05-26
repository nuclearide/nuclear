import * as React from 'react';
import { readdir, readdirSync, statSync, watch, FSWatcher } from 'fs';

import { join, resolve, basename } from 'path';
import { Nuclear, WindowEvents } from "../../Nuclear";

import { Tree, Icon } from 'antd';
import * as electron from "electron";
import { LOCALSTORAGE_PROJECT_PATH, USED_HOTKEYS } from "../../utils/constants";
const TreeNode = Tree.TreeNode;

var debounce = function (func, wait, immediate?) {
    var timeout;
    return function () {
        var context = this, args = arguments;
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

interface FileExplorerProps {
    toggleState: (newState: object) => void;
    loading: boolean;
    toggleFileSearch: (e: KeyboardEvent) => void;
    path: string;
}

export default class FileExplorer extends React.Component<FileExplorerProps, any> {
    // watch: FSWatcher;
    constructor(props) {
        super(props)
        this.state = {
            projectName: 'Project',
            tree: {},
        }
    }

    async renderItems(path: string) {
        return new Promise(async (resolve) => {
            readdir(path, async (err, files) => {
                const tree = {};
                for (let f of files) {
                    let file = join(path, f);
                    if (statSync(file).isDirectory()) {
                        tree[f] = await this.renderItems(file);
                    } else {
                        tree[f] = file;
                    }
                };
                resolve(tree);
            });
        });
    }

    renderTree(tree = this.state.tree) {
        const iconStyle = {
            left: "-19px",
            top: "4px",
            position: "absolute",
            background: '#262626',
            color: "white"
        };
        return Object.keys(tree).map((file, key) => {
            if (typeof tree[file] == "object") {
                return (
                    <TreeNode title={file} key={file} selectable={false}>
                        {this.renderTree(tree[file])}
                    </TreeNode>
                )
            } else {
                return <TreeNode title={file} key={tree[file]} />
            }
        })
    }
    render() {
        return (
            <Tree
                onSelect={(file) => {
                    if (!file || !file.length) {
                        return;
                    }
                    console.log('opening', file)
                    Nuclear.Editor.open(file[0]);
                }}
                showLine
                defaultExpandedKeys={['main']}
            >
                <TreeNode key={'main'} title={this.state.projectName} selectable={false} disabled={this.props.loading}>
                    {this.renderTree()}
                </TreeNode>
            </Tree>
        );
    }

    async changeFileTree(dir: string) {
        if (dir && !this.props.loading) {
            await this.props.toggleState({ loading: true });
            const dirList = dir.split('/');
            const lastDirName = dirList[dirList.length - 1];
            // this.renderItems() causes browser to hang for a while (sometimes very good while)
            // for that case setTimeout allows us to render Loading state and then rerender file tree
            // probably needs refactoring :joy:
            setTimeout(async () => {
                const tree = await this.renderItems(dir);
                await this.setState({ tree, projectName: lastDirName });
                await this.props.toggleState({ loading: false });
                await localStorage.setItem(LOCALSTORAGE_PROJECT_PATH, dir);
            }, 100);
        }
    }

    async componentDidMount() {
        var onChange = debounce((type, file) => {
            Nuclear.Editor.externalChange(type, file);
        }, 1000);
        // this.watch = watch(root, { recursive: true }, onChange);
        WindowEvents.addListener('open', async () => {
            try {
                const data: string[] | undefined = await electron.remote.dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory', 'multiSelections'] })
                console.log('files', data)
                await this.changeFileTree(data[0])
                await this.props.toggleState({ path: data[0] })
            } catch (e) {
                // no-op
                console.log('e', e);
            }
        });
        window.addEventListener('keydown', this.props.toggleFileSearch)
        const openedProject = localStorage.getItem(LOCALSTORAGE_PROJECT_PATH);
        if (openedProject && !this.state.path) {
            console.log('loading from localstorage', openedProject);
            await this.changeFileTree(openedProject)
            await this.props.toggleState({ path: openedProject })
        }
    }
}