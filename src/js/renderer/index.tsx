import * as React from 'react';
import {render} from 'react-dom';
import App from './components/App';
import { ReactIDE } from '../ReactIDE';
import { readdir } from 'fs';

render(<App/>, document.getElementById('root'));

readdir(__dirname+'/../plugins', (err, files) => {
    files.forEach(file => ReactIDE.Plugins.load(file));
});

addEventListener('beforeunload', () => {
    for(var plugin in ReactIDE.Plugins.plugins()) {
        ReactIDE.Plugins.unload(plugin);
    }
})