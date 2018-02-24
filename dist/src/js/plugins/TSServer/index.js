"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReactIDE_1 = require("../../ReactIDE");
const events_1 = require("events");
const path_1 = require("path");
require("./client");
const client_1 = require("./client");
class TSServer {
    constructor() {
        this.tsserver = new TSServerProvider;
    }
    onLoad() {
        ReactIDE_1.ReactIDE.CompletionProviders.add(this.tsserver);
    }
    onUnload() {
        ReactIDE_1.ReactIDE.CompletionProviders.remove(this.tsserver);
    }
}
exports.default = TSServer;
var t = new client_1.TSServerClient();
t.cmd('open', {
    file: '/Users/simonhochrein/Documents/Github/reactide/src/js/plugins/TSServer/client.ts'
});
class TSServerProvider {
    constructor() {
        this.events = new events_1.EventEmitter();
    }
    loadFile(filePath) {
        t.cmd('open', {
            file: path_1.join('/Users/simonhochrein/Documents/Github/reactide', filePath)
        });
        return true;
    }
    getAtPosition(position, token, filePath, cb) {
        console.log(position);
        t.cmd('completions', {
            file: path_1.join('/Users/simonhochrein/Documents/Github/reactide', filePath),
            line: position.line,
            offset: position.ch,
            prefix: token,
            includeExternalModuleExports: true
        }, (error, res) => {
            if (error)
                console.log(error);
            else
                cb(res.body.map(({ name }) => name));
        });
    }
    getCompletionDetails(filePath, index, name) {
    }
    updateFile(filePath, source) {
        // s.files[filePath] = ts.ScriptSnapshot.fromString(source);
    }
    change(filePath, to, from, insertString) {
        console.log(to, from, insertString);
        // t.cmd('change', {
        //     file: filePath,
        //     insertString,
        //     line: from.line + 1,
        //     offset: from.ch + 1,
        //     endLine: to.line + 1,
        //     endOffset: to.ch + 1
        // });
    }
}
// function crawl(node: ts.Node) {
//     (node.kind==ts.SyntaxKind.JsxElement || node.kind==ts.SyntaxKind.JsxSelfClosingElement || node.kind==ts.SyntaxKind.JsxText) && console.log(node.getText());
//     node.forEachChild((newNode) => {
//         crawl(newNode);
//     })
// }
