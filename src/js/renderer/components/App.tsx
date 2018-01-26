import * as React from 'react';
import {Grid} from 'semantic-ui-react';
import { Editor } from './Editor';
import FileExplorer from './FileExplorer';

export default class App extends React.Component {
    render() {
        return (
            <Grid id="main-grid" padded>
                <Grid.Column width={3} className="panel">
                    <FileExplorer/>
                </Grid.Column>
                <Grid.Column width={10} className="panel">
                    Main Content
                    <Editor/>
                </Grid.Column>
                <Grid.Column width={3} className="panel">
                    Settings
                </Grid.Column>
            </Grid>
        );
    }
}