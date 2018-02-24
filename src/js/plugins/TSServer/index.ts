import { spawn, ChildProcess } from 'child_process';
import { ReactIDE } from '../../ReactIDE';
import { EventEmitter } from 'events';
import * as ts from 'typescript';
import { readFileSync } from 'fs';
import * as CodeMirror from 'codemirror';
import { normalize, join, resolve } from 'path';
import {TypescriptLanguageServiceHost} from './host';
export default class TSServer {
    private tsserver = new TSServerProvider;

    onLoad() {
        ReactIDE.CompletionProviders.add(this.tsserver);
    }
    onUnload() {
        ReactIDE.CompletionProviders.remove(this.tsserver);
    }
}

var t = new TypescriptLanguageServiceHost();

var t = new TypescriptLanguageServiceHost();
var r = ts.createDocumentRegistry();
var s = ts.createLanguageService(t, r);

var root = resolve(".");

t.addFile(join(root, "/node_modules/typescript/lib/lib.d.ts"), readFileSync(join(root, '/node_modules/typescript/lib/lib.d.ts'), 'utf8'));
t.addFile(join(root, "/node_modules/@types/node/index.d.ts"), readFileSync(join(root, '/node_modules/@types/node/index.d.ts'), 'utf8'));
t.addFile(join(root, "/node_modules/@types/node/inspector.d.ts"), readFileSync(join(root, '/node_modules/@types/node/inspector.d.ts'), 'utf8'));
t.addFile(join(root, "/node_modules/electron/electron.d.ts"), readFileSync(join(root, '/node_modules/electron/electron.d.ts'), 'utf8'));



class TSServerProvider implements ReactIDE.CompletionProvider {
    events = new EventEmitter();
    loadFile(filePath) {
        t.addFile(filePath, readFileSync(filePath, 'utf8'));
        return true;
    }
    getAtPosition(position: number, token: string, filePath, cb: (list: string[]) => void) {
        var {entries} = s.getCompletionsAtPosition(filePath, 0, {includeExternalModuleExports: true, includeInsertTextCompletions: true});
        
        var completions = entries.map(({ name }) => name).filter((name) => name.slice(0, token.length) == token)
        // for(var i = 0; i < completions.length; i++) {
        //     // console.log(s.getCompletionEntryDetails(filePath, 0, completions[i], null, null));
        //     console.log(s.getCompletionEntryDetails(filePath, 0, completions[i], null, null));
        // }

        cb(completions);
    }
    getCompletionDetails(filePath: string, index: number, name: string) {

    }

    definition(filePath: string, position: number) {
        return s.getDefinitionAtPosition(filePath, position);
    }

    updateFile(filePath, source) {
        // s.files[filePath] = ts.ScriptSnapshot.fromString(source);
    }
    change(filePath: string, text) {
        t.updateFile(filePath, text);
        // console.log(to, from, insertString);
        // t.cmd('change', {
        //     file: join('/Users/simonhochrein/Documents/Github/reactide', filePath),
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