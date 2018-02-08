import {spawn, ChildProcess} from 'child_process';
import { ReactIDE } from '../../ReactIDE';
import { EventEmitter } from 'events';

var dir = "/Users/simonhochrein/Documents/GitHub/reactide";

var proc: ChildProcess = spawn(dir+'/node_modules/typescript/bin/tsserver', [], {
    cwd: dir
});;

export default class TSServer {
    private tsserver = new TSServerProvider;

    onLoad() {
        ReactIDE.CompletionProviders.add(this.tsserver);
    }
    onUnload() {
        ReactIDE.CompletionProviders.remove(this.tsserver);
        proc.kill();
    }
}

class TSServerProvider implements ReactIDE.CompletionProvider {
    events = new EventEmitter();
    constructor() {
        var buffer = "";
        var bufferLength = 0;
        proc.stdout.on('data', (data) => {
            var string = data.toString();
            if(!buffer) {
                var segments = string.split('\n');
                var segment = segments[0];
                let length = parseInt(segment.slice("Content-Length: ".length, segment.length));

                if(segments[2].length + 1 !== length) {
                    buffer+=segments[2];
                    bufferLength = length;
                } else {
                    this._procEvent(JSON.parse(segments[2]));
                }
            } else {
                if(buffer.length + string.length == bufferLength) {
                    this._procEvent(JSON.parse(buffer+string));
                    buffer = '';
                    bufferLength = 0;
                } else {
                    buffer+=string;
                }
            }

        });
    }
    private _procEvent(obj) {
        switch(obj.request_seq) {
            case 4:
                this.events.emit('completions', obj.body);
        }
    }
    loadFile(filePath) {
        this._send({
            "seq":1,
            "type":"quickinfo",
            "command":"open",
            "arguments":{
                "file":dir+"/"+filePath
            }
        });
        return true;
    }
    getAtCursor(cursor: CodeMirror.Position, filePath, cb: (list: string[]) => void) {
        this._send({
            "seq":4,
            "type":"quickinfo",
            "command":"completions",
            "arguments":{
                "file":dir+"/"+filePath,
                "line": cursor.line,
                "offset": cursor.ch,
                "prefix": ""
            }
        });
        this.events.once('completions', (list) => {
            var completions = list.map(({name}) => {
                return name;
            });
            cb(completions);
        });
    }
    private _send(message) {
        proc.stdin.write(JSON.stringify(message)+'\n');
    }
}