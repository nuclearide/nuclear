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


class TSServerProvider implements ReactIDE.CompletionProvider {
    events = new EventEmitter();
    loadFile(filePath) {
        s.addFile(filePath, readFileSync(filePath, 'utf8'));
        return true;
    }
    getAtCursor(cursor: CodeMirror.Position, filePath, cb: (list: string[]) => void) {
        var {entries} = service.getCompletionsAtPosition("./index.ts", 0, {includeExternalModuleExports: true});
        cb(entries.map(({name}) => name));
    }
}

// function crawl(node: ts.Node) {
//     (node.kind==ts.SyntaxKind.JsxElement || node.kind==ts.SyntaxKind.JsxSelfClosingElement || node.kind==ts.SyntaxKind.JsxText) && console.log(node.getText());
//     node.forEachChild((newNode) => {
//         crawl(newNode);
//     })
// }