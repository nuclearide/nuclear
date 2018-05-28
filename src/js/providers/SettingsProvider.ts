import React from 'react';
import { Settings } from '../components/Settings';
import { EventEmitter } from 'events';

let settings = {
    test: "test",
    theme: "default"
};

let SettingsContext = React.createContext(settings);

class SettingsProvider extends EventEmitter {
    get(key?: string) {
        if (key) {
            return settings[key];
        } else {
            return settings;
        }
    }
    set(key: string, value) {
        settings[key] = value;
        this.emit('change');
    }
}

let settingsProvider = new SettingsProvider();

export {
    SettingsContext,
    settingsProvider
};