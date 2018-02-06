import * as EventEmitter from 'events';
import {ipcRenderer} from 'electron';

const EditorEvents = new EventEmitter();

type EditorEvent = "open" | "close" | "focus" | "save";


export namespace ReactIDE {
    export class Editor {
        static open(filePath: string) {
            EditorEvents.emit('open', filePath);
        }
        static saveAll() {
            EditorEvents.emit('save');
        }
        static close(filePath: string) {
            EditorEvents.emit('close', filePath);
        }
        static focus(filePath: string | boolean) {
            EditorEvents.emit('focus', filePath);
        }
        static externalChange(type: string, file: string): void {
            EditorEvents.emit('externalChange', type, file);
        }
        static on(name: EditorEvent, cb: (...data: any[]) => void) {
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

ipcRenderer.on('close', () => {
    EditorEvents.emit('close');
});

ipcRenderer.on('goToFile', () => {
    alert('Go To File');
});

ipcRenderer.on('commandPalette', () => {
    alert("Command Palette");
});