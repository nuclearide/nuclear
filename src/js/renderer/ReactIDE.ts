import * as EventEmitter from 'events';

const EditorEvents = new EventEmitter();

export namespace ReactIDE {
    export class Editor {
        static open(filePath: string) {
            EditorEvents.emit('open', filePath);
        }
        static on(name, cb) {
            EditorEvents.on(name, cb);
        }
        static once(...args) {
            EditorEvents.once.apply(this, arguments);
        }
    }
}