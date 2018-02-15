import * as React from 'react';
import {Grid} from 'semantic-ui-react';
import FileExplorer from './FileExplorer';
import TabBar from './TabBar';
import Emulator from './Emulator';

export default class App extends React.Component {
    render() {
        return (
            <Grid id="main-grid" padded>
                <Grid.Column width={3} className="panel">
                    <FileExplorer/>
                </Grid.Column>
                <Grid.Column width={10} className="panel">
                    <TabBar/>
                    <Emulator/>
                </Grid.Column>
                <Grid.Column width={3} className="panel">
                    Settings
                </Grid.Column>
            </Grid>
        );
    }
}