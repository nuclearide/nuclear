import * as React from 'react';
import { readdir, readdirSync, statSync, watch, FSWatcher } from 'fs';

import { join, resolve, basename } from 'path';
import { Nuclear } from '../../Nuclear';

import { Tree, Icon } from 'antd';
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

export default class FileExplorer extends React.Component<any, any> {
    // watch: FSWatcher;
    constructor(props) {
        super(props)
        this.state = {
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
                    <TreeNode title={file} key={file}>
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
            <Tree onSelect={(file) => {console.log(file[0]);Nuclear.Editor.open(file[0])}} showLine>
                <TreeNode title="Project">
                    {this.renderTree()}
                </TreeNode>
            </Tree>
        );
    }
    async componentDidMount() {

        this.setState({tree: await this.getTree(Nuclear.getProjectRoot())});

        var onChange = debounce((type, file) => {
            Nuclear.Editor.externalChange(type, file);
        }, 1000);
        // this.watch = watch(root, { recursive: true }, onChange);
    }
    componentWillUnmount() {
        // this.watch.close();
    }
}