import React from "react";
import { SettingsProvider, settingsProvider } from "../providers/SettingsProvider";
import { Input } from "antd";

export class Settings extends React.Component<any, { test: string, qwe: string }> {
    render() {
        return (
            <Input onChange={(e) => settingsProvider.set("theme", e.target.value)} />
        )
    }
}