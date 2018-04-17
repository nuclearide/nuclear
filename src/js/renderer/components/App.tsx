import * as React from 'react';
import FileExplorer from './FileExplorer';
import TabBar from './TabBar';
import Emulator from './Emulator';
import Toolbar from './Toolbar';

import {Layout} from 'antd'

export default class App extends React.Component {
    render() {
        return (
            <Layout>
                {/* <Toolbar/> */}
                <Layout.Sider style={{ background: '#fff' }} width={400}>
                    <br/>
                    {/* <progress id="progress"/> */}
                    <FileExplorer/>
                </Layout.Sider>
                <Layout.Content>
                    <TabBar/>
                    <Emulator/>
                </Layout.Content>
            </Layout>
        );
    }
}