import * as React from 'react';
import { readdir, readdirSync, statSync, watch, FSWatcher } from 'fs';

import { join, resolve, basename } from 'path';
import { Nuclear, WindowEvents } from "../../Nuclear";

import { Tree, Icon } from 'antd';
import * as electron from "electron";
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
    toggleLoading: (loading: boolean) => void;
    loading: boolean;
}

export default class FileExplorer extends React.Component<FileExplorerProps, any> {
    // watch: FSWatcher;
    constructor(props) {
        super(props)
        this.state = {
            projectName: 'Project',
            tree: this.renderItems(Nuclear.getProjectRoot())
        }
    }

    async getTree(path) {
        return new Promise(resolve => {
            // FileSystem.readdir(path, async (files) => {
            //     var ret = {};
            //     for(var file of files) {
            //         if(file != 'node_modules' && file != '.git' && file != '.cache') {
            //             await new Promise(resolve2 => {
            //                 FileSystem.isDir(join(path, file), async (res) => {
            //                     if(res) {
            //                         ret[file] = await this.getTree(join(path, file));
            //                     } else {
            //                         ret[file] = join(path, file);
            //                     }
            //                     resolve2();
            //                 });
            //             });
            //         }
            //     }
            //     resolve(ret);
            // });
        });
    }
    renderItems(path: string) {
        var files = readdirSync(path);
        var tree = {};
        files.forEach(f => {
            let file = join(path, f);
            if(statSync(file).isDirectory()) {
                tree[f] = this.renderItems(file);
            } else {
                tree[f] = file;
            }
        });
        return tree;
    }

    renderTree(tree = this.state.tree) {
        const iconStyle = {
            left: "-19px",
            top: "4px",
            position: "absolute",
            background: "white"
        };
        return Object.keys(tree).map((file, key) => {
            if(typeof tree[file] == "object") {
                return (
                    <TreeNode title={file} key={file} selectable={false}>
                        {this.renderTree(tree[file])}
                    </TreeNode>
                )
            } else {
                return <TreeNode title={file} key={tree[file]}/>
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
            >
                <TreeNode title={this.state.projectName} selectable={false} disabled={this.props.loading}>
                    {this.renderTree()}
                </TreeNode>
            </Tree>
        );
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
                if (data && !this.props.loading) {
                    await this.props.toggleLoading(true);
                    const dir = data[0];
                    const dirList = dir.split('/');
                    const lastDirName = dirList[dirList.length - 1];
                    // this.renderItems() causes browser to hang for a while (sometimes very good while)
                    // for that case setTimeout allows us to render Loading state and then rerender file tree
                    // probably needs refactoring :joy:
                    setTimeout(async () => {
                        const tree = this.renderItems(dir);
                        await this.setState({ tree, projectName: lastDirName });
                        await this.props.toggleLoading(false)
                    }, 100);
                }
            } catch (e) {
                // no-op
                console.log('e', e);
            }
        })
    }
    componentWillUnmount() {
        // this.watch.close();
        WindowEvents.on('open', () => {});
    }
}