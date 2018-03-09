import { List, Icon } from 'semantic-ui-react';
import * as React from 'react';
import { readdir, statSync, watch, FSWatcher } from 'fs';
import { join, resolve, basename } from 'path';
import { Nuclear } from '../../Nuclear';

var root = resolve(".");

class Directory extends React.Component<{ path: string }, { files: { name: string, path: string, type: string }[], open: number[] }> {

    constructor(props) {
        super(props);
        this.state = { files: [], open: [] };
    }
    render() {
        return (
            <div className="list">
                {this.state.files.map((file, key) => {
                    return (
                        <div key={key}>
                            <div onClick={this.onClick.bind(this, file, key)} className="entry">
                                {file.type == 'dir' && <i className={"fa "+(this.state.open.indexOf(key) > -1 ? 'fa-caret-down' : 'fa-caret-right')} />}
                                {file.type == 'file' && <i className={'fa fa-file'} />}
                                &nbsp;
                                {file.name}
                            </div>
                            <div style={{ paddingLeft: 10 }}>
                                {this.state.open.indexOf(key) > -1 && <Directory path={file.path} />}
                            </div>
                        </div>
                    );
                })}
                {
                    this.state.files.length == 0 &&
                    <div>
                        No Items
                    </div>
                }
            </div>
        )
    }
    onClick(file, key) {
        if (file.type === 'dir') {
            this.toggleFolder(key);
        } else {
            Nuclear.Editor.open(file.path);
        }
    }
    toggleFolder(index) {
        var open = this.state.open;
        var i = open.indexOf(index);
        if (i > -1) {
            open.splice(i, 1);
        } else {
            open.push(index);
        }
        console.log(open);
        this.setState({ open });
    }
    componentDidMount() {
        readdir(this.props.path, (err, files) => {
            this.setState({
                files: files.map((file) => {
                    return {
                        name: file,
                        path: join(this.props.path, file),
                        type: statSync(join(this.props.path, file)).isDirectory() ? 'dir' : 'file'
                    };
                })
            });
        });
    }
}

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
    watch: FSWatcher;

    render() {
        return (
            <div className="list">
                <i className="fa fa-folder"/> {basename(root)}
                <Directory path={root} />
            </div>
        );
    }
    componentDidMount() {
        var onChange = debounce((type, file) => {
            Nuclear.Editor.externalChange(type, file);
        }, 1000);
        this.watch = watch(root, { recursive: true }, onChange);
    }
    componentWillUnmount() {
        this.watch.close();
    }
}