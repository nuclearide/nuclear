import * as React from 'react';

export default class Emulator extends React.Component {
    render() {
        return (
            <div className="panel-column" style={{display: 'flex', flexDirection: 'column'}}>
                {/* <webview src="http://localhost:9999" style={{flex: 1}}></webview>*/}
            </div>
        )
    }
}