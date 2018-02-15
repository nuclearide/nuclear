import {spawn, ChildProcess} from 'child_process';
import { ReactIDE } from '../../ReactIDE';
import { EventEmitter } from 'events';
import * as ts from 'typescript';
import { readFileSync } from 'fs';
import * as CodeMirror from 'codemirror';
import { normalize } from 'path';

export default class TSServer {
    private tsserver = new TSServerProvider;

    onLoad() {
        ReactIDE.CompletionProviders.add(this.tsserver);
    }
    onUnload() {
        ReactIDE.CompletionProviders.remove(this.tsserver);
    }
}

class ReactIDELanguageServiceHost implements ts.LanguageServiceHost {
    files: {[name: string]: ts.IScriptSnapshot} = {};
    getScriptSnapshot(fileName: string): ts.IScriptSnapshot {
        return this.files[fileName];
    }
    getCurrentDirectory() {
        return __dirname;
    }
    getDefaultLibFileName(options: ts.CompilerOptions) {
        return "lib.d.ts";
    }
    getCompilationSettings() {
        return ts.getDefaultCompilerOptions();
    }
    getScriptFileNames() {
        return Object.keys(this.files);
    }
    getScriptVersion() {
        return "";
    }
    addFile(fileName, text) {
        this.files[fileName] = ts.ScriptSnapshot.fromString(text);
    }
}

var s = new ReactIDELanguageServiceHost;
var r = ts.createDocumentRegistry();

var service = ts.createLanguageService(s);
s.addFile('lib.d.ts', readFileSync(normalize('node_modules/typescript/lib/lib.d.ts'), 'utf8'));
s.addFile('node_modules/@types/node/index.d.ts', readFileSync(normalize('node_modules/@types/node/index.d.ts'), 'utf8'));


class TSServerProvider implements ReactIDE.CompletionProvider {
    events = new EventEmitter();
    loadFile(filePath) {
        s.addFile(filePath, readFileSync(filePath, 'utf8'));
        return true;
    }
    getAtPosition(index: number, token: string, filePath, cb: (list: string[]) => void) {
        // console.log(arguments);
        // console.log(index);
        var {entries} = service.getCompletionsAtPosition(filePath, index, {includeExternalModuleExports: true, includeInsertTextCompletions: true});
        var list = entries.filter(({name}) => name.slice(0,token.length) == token).map(({name})=>name);
        console.log(list);
        cb(list);
    }
    getCompletionDetails(filePath: string, index: number, name: string) {

    }

    updateFile(filePath, source) {
        s.files[filePath] = ts.ScriptSnapshot.fromString(source);
    }
}

// function crawl(node: ts.Node) {
//     (node.kind==ts.SyntaxKind.JsxElement || node.kind==ts.SyntaxKind.JsxSelfClosingElement || node.kind==ts.SyntaxKind.JsxText) && console.log(node.getText());
//     node.forEachChild((newNode) => {
//         crawl(newNode);
//     })
// }