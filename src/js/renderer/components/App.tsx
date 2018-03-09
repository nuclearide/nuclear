import * as React from 'react';
import FileExplorer from './FileExplorer';
import TabBar from './TabBar';
import Emulator from './Emulator';
import Toolbar from './Toolbar';

export default class App extends React.Component {
    render() {
        return (
            <div>
                <Toolbar/>
                <div id="main-grid" className="grid">
                    <div className="three columns panel">
                        <br/>
                        <FileExplorer/>
                    </div>
                    <div className="ten columns panel" style={{background: 'rgb(57,67,83)'}}>
                        <TabBar/>
                        <Emulator/>
                    </div>
                </div>
            </div>
        );
    }
}