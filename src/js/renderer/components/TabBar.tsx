import * as React from "react";
import { Nuclear } from "../../Nuclear";
import { Editors } from "./Editors";
import { parse } from "path";
import {Tabs, Icon} from "antd";
import Editor from "./Editor";

export default class TabBar extends React.Component<any, { files: string[], changed: number[], active: number }> {
    files: { [file: string]: HTMLDivElement } = {};

    constructor(props) {
        super(props);
        this.state = {
            files: [

            ],
            changed: [

            ],
            active: 0
        }
    }

    render() {
        return (
            <Tabs
                hideAdd
                onChange={this.select}
                activeKey={this.state.active.toString()}
                type="editable-card"
                onEdit={this.edit}
                tabBarStyle={{margin: 0}}
            >
                {this.state.files.map((file, key) => 
                    <Tabs.TabPane tab={<span><Icon type="file"/> {file}</span>} key={key.toString()}>
                        <Editor file={file}/>
                    </Tabs.TabPane>
                )}
            </Tabs>
        );
    }
    select = (i) => {
        this.setState({ active: i });
        // Nuclear.Editor.focus(file);
    }
    edit = (i, action) => {
        console.log(i, action);
        if(action == "remove") {
            let {files, active} = this.state;
            files.splice(i, 1);
            if(active - 1 > 0) {
                this.setState({files, active: active - 1});
            } else {
                this.setState({files, active: 0});
            }
        }
    }
    componentDidMount() {
        Nuclear.Editor.on('open', (filePath) => {
            var files = this.state.files;
            let i;
            if ((i = files.indexOf(filePath)) > -1) {
                this.setState({ active: filePath });
                return;
            } else {
                files.push(filePath);
                this.setState({ files, active: files.length - 1 });
                return;
            }
        });
        Nuclear.Editor.on('close', (file) => {
            if (!file) {
                this.close(this.state.active);
            }
        });
    }
    close(file, e?: Event) {
        e && e.stopPropagation();
        var { active, files, changed } = this.state;
        var index = files.indexOf(file);
        if (files.length == 0) {
            Nuclear.Editor.focus(false);
        } else {
            if (index < active|| index == 0) {
                this.select(files[index + 1]);
                Nuclear.Editor.close(file);
            } else {
                this.select(files[index - 1]);
                Nuclear.Editor.close(file);
            }
        }

        files.splice(index, 1);
        this.setState({ files });
    }
}