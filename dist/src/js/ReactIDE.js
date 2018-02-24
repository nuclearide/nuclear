"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("events");
const electron_1 = require("electron");
const EditorEvents = new EventEmitter();
const WindowEvents = new EventEmitter();
let _plugins = {};
let _fileTypes = [];
let _completionProvider;
var ReactIDE;
(function (ReactIDE) {
    class Editor {
        static open(filePath) {
            EditorEvents.emit('open', filePath);
        }
        static saveAll() {
            EditorEvents.emit('save');
        }
        static close(filePath) {
            EditorEvents.emit('close', filePath);
        }
        static focus(filePath) {
            EditorEvents.emit('focus', filePath);
        }
        static externalChange(type, file) {
            EditorEvents.emit('externalChange', type, file);
        }
        static on(name, cb) {
            EditorEvents.on(name, cb);
        }
        static once(...args) {
            EditorEvents.once.apply(this, arguments);
        }
    }
    ReactIDE.Editor = Editor;
    class Plugin {
        onLoad() {
            throw new Error("Not Implemented");
        }
        onUnload() {
            throw new Error("Not Implemented");
        }
    }
    ReactIDE.Plugin = Plugin;
    class Plugins {
        static load(name) {
            _plugins[name] = new (require('./plugins/' + name).default)();
            _plugins[name].onLoad();
        }
        static unload(name) {
            _plugins[name].onUnload();
        }
        static plugins() {
            return _plugins;
        }
    }
    ReactIDE.Plugins = Plugins;
    class FileTypes {
        static add(match, type) {
            _fileTypes.push({
                match,
                type
            });
        }
        static remove(match, type) {
            let i = _fileTypes.findIndex((fileType) => fileType.match == match && fileType.type == type);
            _fileTypes.splice(i, 1);
        }
        static getForFile(fileName) {
            var match = _fileTypes.find((fileType) => {
                return fileType.match.test(fileName);
            });
            return (match && match.type) || 'text/plain';
        }
    }
    ReactIDE.FileTypes = FileTypes;
    class CompletionProviders {
        static add(provider) {
            _completionProvider = provider;
        }
        static remove(provider) {
            _completionProvider = null;
        }
        static get() {
            return _completionProvider;
        }
    }
    ReactIDE.CompletionProviders = CompletionProviders;
    class Window {
        static on(name, cb) {
            WindowEvents.on(name, cb);
        }
    }
    ReactIDE.Window = Window;
})(ReactIDE = exports.ReactIDE || (exports.ReactIDE = {}));
electron_1.ipcRenderer.on('open', () => {
    EditorEvents.emit('open');
});
electron_1.ipcRenderer.on('save', () => {
    EditorEvents.emit('save');
});
electron_1.ipcRenderer.on('close', () => {
    EditorEvents.emit('close');
});
electron_1.ipcRenderer.on('goToFile', () => {
    alert('Go To File');
});
electron_1.ipcRenderer.on('commandPalette', () => {
    alert("Command Palette");
});
window.addEventListener('beforeunload', () => {
    WindowEvents.emit('close');
});
