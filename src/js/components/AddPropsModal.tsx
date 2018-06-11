import * as React from 'react';
import { Table, Divider, Modal, Input, Button, Form, Dropdown, Menu, Icon } from 'antd';
import { ModalProps } from 'antd/lib/modal/Modal';

interface AddPropsModalProps extends ModalProps {
    onCancel: () => void;
    visible: boolean;
    onSubmit: (props: Array<{ name, type, value }>) => void;
}

type AddPropsModalState = {
    data: Array<{ name, type, value }>,
    name: string,
    type: string,
    value: string,
    error: string,
}

export enum ADD_PROP_TYPES {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    FUNCTION = 'function'
}

export
class AddPropsModal extends React.Component<AddPropsModalProps, AddPropsModalState> {

    state = {
        data: [],
        value: '',
        name: '',
        type: ADD_PROP_TYPES.STRING,
        error: ''
    }

    columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        }, {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
              <span>
                <a onClick={() => this.deleteProp(record)}>Delete</a>
              </span>
            ),
        }
    ];

    deleteProp = (prop: { name, type, value }) => {
        const newData = this.state.data.filter(d => d.name !== prop.name);
        return this.setState({ data: newData })
    }

    addProps = () => {
        const { name, value, type, data } = this.state;
        if (name && value && type) {
            return this.setState({ 
                data: [...data, { name, value, type }],
                error: '',
                name: '',
                value: '',
                type: 'string',
            });
        }
        return this.setState({ error: 'Fields cannot be empty' })
    }

    render() {
        const { error } = this.state;
        console.log(this.state)

        const menu = (
            <Menu onClick={async (e) => this.setState({ type: e.key })}>
                <Menu.Item key={ADD_PROP_TYPES.STRING}>{ADD_PROP_TYPES.STRING}</Menu.Item>
                <Menu.Item key={ADD_PROP_TYPES.NUMBER}>{ADD_PROP_TYPES.NUMBER}</Menu.Item>
                <Menu.Item key={ADD_PROP_TYPES.BOOLEAN}>{ADD_PROP_TYPES.BOOLEAN}</Menu.Item>
            </Menu>
        )

        return (
            <Modal 
                {...this.props} 
                footer={
                    <ModalFooter 
                        data={this.state.data} 
                        onCancel={this.props.onCancel}
                        onSubmit={this.props.onSubmit}
                    />
                }
            >
                <Form.Item label="Name">
                    <Input value={this.state.name} onChange={(e) => this.setState({ name: e.target.value })} />
                </Form.Item>
                <Form.Item label="Type">
                    <Dropdown overlay={menu}>
                        <Button style={{ marginLeft: 8 }}>
                            {this.state.type} <Icon type="down" />
                        </Button>
                    </Dropdown>
                </Form.Item>
                <Form.Item label="Value">
                    <Input value={this.state.value} onChange={(e) => this.setState({ value: e.target.value })} />
                </Form.Item>
                <Form.Item>
                    <Button onClick={this.addProps}>Add prop</Button>
                </Form.Item>
                {
                    error.length ? <div style={{ color: 'red' }}>{error}</div> : null
                }
                <Divider type={'horizontal'} />
                <Table columns={this.columns} dataSource={this.state.data} />
            </Modal>
        )
    }
}

const ModalFooter = (props) => {
    return <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div>
            <Button onClick={props.onCancel}>Cancel</Button>
            <Button onClick={() => props.onSubmit(props.data)}>Apply</Button>
        </div>
    </div>
}