import * as React from "react";
import { Tab, Icon } from "semantic-ui-react";
import { ReactIDE } from "../../ReactIDE";
import { Editors } from "./Editors";
import { parse } from "path";

export default class TabBar extends React.Component<any, { files: string[], changed: number[], active: string }> {
    files: {[file: string]: HTMLDivElement} = {};

    constructor(props) {
        super(props);
        this.state = {
            files: [

            ],
            changed: [

            ],
            active: ''
        }
    }

    render() {
        return (
            <div className="panel-column">
                <div style={{ display: this.state.files.length > 0 ? 'block' : 'none' }}>
                    <div className="ui top attached tabular menu" style={{overflowX: 'auto', overflowY: 'hidden'}}>
                        {this.state.files.map((file, key) =>
                            <div key={key} className={"item" + (this.state.active == file ? ' active' : ' inverted')} onClick={() => { this.select(file) }} ref={e => this.files[file] = e}>
                                {parse(file).base}
                                <Icon name="asterisk" style={{ display: ~this.state.changed.indexOf(key) ? 'inline-block' : 'none' }} />
                                <Icon name="close" onClick={this.close.bind(this, file)} />
                            </div>
                        )}
                    </div>
                    <div className="ui bottom attached active tab segment">
                        <Editors />
                    </div>
                </div>
                <h1 style={{ display: this.state.files.length == 0 ? 'block' : 'none' }}>Welcome to ReactIDE</h1>
            </div>
        );
    }
    select(file) {
        this.setState({ active: file });
        ReactIDE.Editor.focus(file);
    }
    componentDidMount() {
        ReactIDE.Editor.on('open', (filePath) => {
            var files = this.state.files;
            let i;
            if((i = files.indexOf(filePath)) > -1) {
                this.setState({active: filePath});
                return;
            } else {
                files.push(filePath);
                this.setState({ files, active: files[files.length - 1] });
            }
        });
        ReactIDE.Editor.on('close', (file) => {
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
            ReactIDE.Editor.focus(false);
        } else {
            if (index < files.indexOf(active) || index == 0) {
                this.select(files[index + 1]);
                ReactIDE.Editor.close(file);
            } else {
                this.select(files[index - 1]);
                ReactIDE.Editor.close(file);
            }
        }

        files.splice(index, 1);
        this.setState({ files });
    }
    onChange(key: number, isDirty: boolean) {
        if (isDirty) {
            if (this.state.changed.indexOf(key) == -1) {
                var changed = this.state.changed;
                changed.push(key);
                this.setState({ changed });
            }
        } else {
            var index = this.state.changed.indexOf(key);
            if (index > -1) {
                var changed = this.state.changed;
                changed.splice(index, 1);
                this.setState({ changed });
            }
        }
    }
}