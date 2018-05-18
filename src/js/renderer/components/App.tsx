import * as React from 'react';
import FileExplorer from './FileExplorer';
import TabBar from './TabBar';
import Emulator from './Emulator';
import Toolbar from './Toolbar';

import {Layout} from 'antd'

export default class App extends React.Component {

    state = {
        loading: false,
    }

    toggleLoadingTree = async (loading: boolean) => {
        await this.setState({ loading: loading })
    }

    render() {
        return (
            <Layout>
                {/* <Toolbar/> */}
                <Layout.Sider style={{ background: '#fff' }} width={400}>
                    <br/>
                    {this.state.loading ? <h4 style={{ marginLeft: 10 }}>Loading</h4> : null}
                    {/* <progress id="progress"/> */}
                    <FileExplorer
                        toggleLoading={async (val: boolean) => await this.toggleLoadingTree(val)}
                        loading={this.state.loading}
                    />
                </Layout.Sider>
                <Layout.Content>
                    <TabBar/>
                    <Emulator/>
                </Layout.Content>
            </Layout>
        );
    }
}