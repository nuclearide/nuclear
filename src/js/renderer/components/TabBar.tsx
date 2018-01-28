import * as React from "react";
import { Tab, Icon } from "semantic-ui-react";
import { ReactIDE } from "../ReactIDE";
import { Editor } from "./Editor";

export default class TabBar extends React.Component<any, {files: string[], activeIndex: number}> {
    constructor(props) {
        super(props);
        this.state = {
            files: [

            ],
            activeIndex: -1
        }
    }
    handleTabChange = (e, { activeIndex }) => this.setState({ activeIndex })
    render() {
        return (
            (this.state.files.length > 0 && <div>
                <div className="ui top attached tabular menu">
                    {this.state.files.map((file, key) => <div key={key} className={"item"+(this.state.activeIndex == key ? ' active' : '')} onClick={() => {this.setState({activeIndex: key})}}>{file}<Icon name="close" onClick={this.close.bind(this, key)}/></div>)}
                </div>
                <div className="ui bottom attached active tab segment">
                    {this.state.files.map((file, key) => <div key={key} style={{display: this.state.activeIndex == key ? 'block' : 'none'}}><Editor filePath={file}/></div>)}
                </div>
            </div>) || (
                <h1>Welcome to ReactIDE</h1>
            )
        );
    }
    componentDidMount() {
        ReactIDE.Editor.on('open', (filePath) => {
            var files = this.state.files;
            files.push(filePath);
            this.setState({files, activeIndex: files.length-1});
        });
    }
    close(key) {
        var {files, activeIndex} = this.state;
        files.splice(key, 1);      
        if(this.state.activeIndex == key) {
            activeIndex-=1;
        }
        console.log(activeIndex);
        this.setState({files, activeIndex});
    }
}