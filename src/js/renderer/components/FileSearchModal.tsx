import * as React from "react";
import { ModalProps } from "antd/lib/modal";
import Modal from "antd/lib/modal/Modal";
import AutoComplete, { DataSourceItemType } from "antd/lib/auto-complete";
import Input from "antd/lib/input/Input";
import Button from "antd/lib/button/button";
import Icon from "antd/lib/icon";
import { AppContext } from "./App";
import { Nuclear } from "../../Nuclear";

interface FileSearchModalProps extends ModalProps {
    visible: boolean;
    path: string;
    foundFiles: Array<{ name: string, path: string }>
    onSelect: (p: string) => void;
}

type FileSearchModalState = {
    value: string;
    data: Array<{ name: string, path: string }>
}

const Option = AutoComplete.Option;

export default class FileSearchModal extends React.Component<FileSearchModalProps> {

    state: FileSearchModalState = {
        value: '',
        data: [],
    }

    handleSearch = (val: string) => {
        const { foundFiles } = this.props;
        const newData = foundFiles
            .map(f => {
                if (f.name.includes(val)) {
                    return f;
                }
            })
            .filter(Boolean)
        console.log('made new data', newData)
        this.setState({ data: newData });
    }

    render() {
        const { visible } = this.props;
        return (
            <Modal
                visible={visible}
                onCancel={this.props.onCancel}
                style={{ height: 80 }}
                title="File search..."
                footer={[<div>Filters will be here</div>]}
            >
                <AutoComplete
                    value={this.state.value}
                    showSearch={true}
                    size="large"
                    style={{ width: '100%' }}
                    onSelect={this.props.onSelect}
                    onChange={(value) => this.setState({ value })}
                    onSearch={this.handleSearch}
                    optionLabelProp={'name'}
                >
                    {this.state.data.map((m) => (<AutoComplete.Option value={m.path}>{m.name} ({m.path})</AutoComplete.Option>))}
                </AutoComplete>
            </Modal>
        );
    }
}