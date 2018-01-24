import * as React from 'react';
import {Grid} from 'semantic-ui-react';
import { Editor } from './Editor';

export default class App extends React.Component {
    render() {
        return (
            <Grid id="main-grid" padded>
                <Grid.Column width={3} className="panel">
                    File Panel
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