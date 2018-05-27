import EventEmitter from 'events';
import { ipcRenderer } from 'electron';
import CodeMirror from 'codemirror';
import { CompletionEntry } from 'typescript';
import { join } from 'path';

export const EditorEvents = new EventEmitter();
export const WindowEvents = new EventEmitter();
let _plugins: { [name: string]: Nuclear.Plugin } = {};
let _fileTypes: { match: RegExp, type: string }[] = [];

type EditorEvent = "open" | "close" | "focus" | "save";

export namespace Nuclear {

    export function getProjectRoot() {
        return join(__dirname, '../');
    }
    export class Editor {
        static open(filePath: string, pos?: number) {
            EditorEvents.emit('open', filePath, pos);
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
        static on(name: string, cb: (...data: any[]) => void) {
            EditorEvents.on.apply(EditorEvents, arguments);
        }
        static once(...args) {
            EditorEvents.once.apply(EditorEvents, arguments);
        }

        static emit(...args) {
            EditorEvents.emit.apply(EditorEvents, arguments);
        }
    }
    export class Plugin {
        onLoad() {
            throw new Error("Not Implemented");
        }
        onUnload() {
            throw new Error("Not Implemented");
        }
    }
    export class Plugins {
        static load(name: string) {
            _plugins[name] = new (require('./plugins/' + name).default)();
            _plugins[name].onLoad();
        }
        static unload(name: string) {
            _plugins[name].onUnload();
        }
        static plugins(): { [name: string]: Nuclear.Plugin } {
            return _plugins;
        }
    }
    export class FileTypes {
        static add(match: RegExp, type: any) {
            _fileTypes.push({
                match,
                type
            });
        }
        static remove(match: RegExp, type: any) {
            let i = _fileTypes.findIndex((fileType) => fileType.match == match && fileType.type == type);
            _fileTypes.splice(i, 1);
        }
        static getForFile(fileName: string) {
            var match = _fileTypes.find((fileType) => {
                return fileType.match.test(fileName);
            })
            return (match && match.type) || 'text/plain';
        }
    }
    export class Window {
        static on(name: 'close', cb: (...data: any[]) => void) {
            WindowEvents.on(name, cb);
        }
    }
}

ipcRenderer.on('open', () => {
    console.log('clicked on OPEN')
    WindowEvents.emit('open');
});
//
ipcRenderer.on('save', () => {
    console.log('save')
});
//
// ipcRenderer.on('close', () => {
//     EditorEvents.emit('close');
// });
//
// ipcRenderer.on('goToFile', () => {
//     alert('Go To File');
// });
//
// ipcRenderer.on('commandPalette', () => {
//     alert("Command Palette");
// });

window.addEventListener('beforeunload', () => {
    WindowEvents.emit('close');
})