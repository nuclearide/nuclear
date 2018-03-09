import * as React from "react";
import Dropdown from "./Dropdown";

export default class Toolbar extends React.Component {
    render() {
        return (
            <div className="toolbar">
                <Dropdown items={[{name: "test"}, {name: "test2"}]} onChange={(e) => {console.log}}/>&nbsp;&nbsp;
                <i className="fa fa-play" style={{color: "#03BD5B"}}/>&nbsp;&nbsp;
                <i className="fa fa-bolt" style={{color: "#FFF547"}}/>&nbsp;&nbsp;
                <i className="fa fa-stop" style={{color: "#FF4751"}}/>
            </div>
        );
    }
}