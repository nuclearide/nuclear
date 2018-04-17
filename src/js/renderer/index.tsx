import * as React from 'react';
import {render} from 'react-dom';
import App from './components/App';
import { Nuclear } from '../Nuclear';

// import { readdir } from 'fs';

render(<App/>, document.getElementById('root'));

var getPlatform = () => {
    switch(process.platform) {
        case "win32":
            return "windows";
        case "darwin":
            return "darwin";
        case "linux":
            return "linux";
        default:
            return "other";
    }
}

document.body.classList.add(getPlatform());

// readdir(__dirname+'/../plugins', (err, files) => {
//     files.forEach(file => Nuclear.Plugins.load(file));
// });

addEventListener('beforeunload', () => {
    for(var plugin in Nuclear.Plugins.plugins()) {
        Nuclear.Plugins.unload(plugin);
    }
});