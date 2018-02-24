"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const child_process_1 = require("child_process");
const readline = require("readline");
const ReactIDE_1 = require("../../ReactIDE");
var bin = path_1.normalize(path_1.join(__dirname, '../../../../node_modules/.bin/tsserver' + (process.platform == 'win32' ? '.cmd' : '')));
class TSServerClient {
    constructor() {
        this.seq = 0;
        this.callbacks = [];
        this.child_process = child_process_1.spawn(bin);
        var { stdin, stdout } = this.child_process;
        var r = readline.createInterface(stdout, stdin);
        r.on('line', (text) => {
            if (text.charAt(0) == '{') {
                this.proc(text);
            }
        });
        ReactIDE_1.ReactIDE.Window.on('close', () => this.child_process.kill());
    }
    cmd(name, args, cb) {
        console.log('test', { "seq": cb ? this.seq : 0, "type": "quickinfo", "command": name, "arguments": args });
        if (cb) {
            this.callbacks[++this.seq] = cb;
        }
        this.send({ "seq": cb ? this.seq : 0, "type": "quickinfo", "command": name, "arguments": args });
    }
    send(data) {
        this.child_process.stdin.write(JSON.stringify(data) + '\n');
    }
    proc(response) {
        var data = JSON.parse(response);
        if (data.request_seq) {
            console.log(data);
            if (data.success == false) {
                this.callbacks[data.request_seq] && this.callbacks[data.request_seq](data.message, null);
            }
            else {
                this.callbacks[data.request_seq] && this.callbacks[data.request_seq](null, data);
            }
        }
        else {
            console.log(data);
        }
    }
}
exports.TSServerClient = TSServerClient;
