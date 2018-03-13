import * as React from "react";
import Dropdown from "./Dropdown";
import Select from 'react-select';

export default class Toolbar extends React.Component {
    render() {
        console.log(Select);
        return (
            <div className="toolbar grid">
                <div className="column">
                    <div className="grid">
                        <div className="column">
                            <Dropdown 
                                items={[{name: "test"}, {name: "test2"}]}
                                onChange={e => console.log}
                            />
                        </div>
                        <div className="column">
                            <button className="button-icon">
                                <i className="fa fa-play" style={{color: "#03BD5B"}}/>
                            </button>
                            <button className="button-icon">
                                <i className="fa fa-bolt" style={{color: "#FFF547"}}/>
                            </button>
                            <button className="button-icon">
                                <i className="fa fa-stop" style={{color: "#FF4751"}}/>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="column">
                </div>
                <div className="column">
                    <div className="pull-right">
                        <div className="inline mr-md">
                            <input type="text" placeholder="search"/>
                        </div>
                        <div className="inline mr-md">
                            <button className="button-icon">
                                <i className="fa fa-lg fa-sync-alt" style={{color: "#cbd3de"}}/>
                            </button>
                            <button className="button-icon">
                                <i className="fa fa-lg fa-cloud-upload-alt" style={{color: "#cbd3de"}}/>
                            </button>
                            <button className="button-icon">
                                <i className="fa fa-lg fa-cloud-download-alt" style={{color: "#cbd3de"}}/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}