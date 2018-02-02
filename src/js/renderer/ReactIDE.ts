import * as EventEmitter from 'events';
import {ipcRenderer} from 'electron';

const EditorEvents = new EventEmitter();

export namespace ReactIDE {
    export class Editor {
        static open(filePath: string) {
            EditorEvents.emit('open', filePath);
        }
        static saveAll() {
            EditorEvents.emit('save');
        }
        static externalChange(type: string, file: string): void {
            EditorEvents.emit('externalChange', type, file);
        }
        static on(name: string, cb: (...data: any[]) => void) {
            EditorEvents.on(name, cb);
        }
        static once(...args) {
            EditorEvents.once.apply(this, arguments);
        }
    }
}

ipcRenderer.on('open', () => {
    EditorEvents.emit('open');
});

ipcRenderer.on('save', () => {
    EditorEvents.emit('save');
});

ipcRenderer.on('goToFile', () => {
    alert('Go To File');
});

ipcRenderer.on('commandPalette', () => {
    alert("Command Palette");
});