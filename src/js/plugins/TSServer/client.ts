import { join, normalize } from 'path';
import { spawn, ChildProcess } from 'child_process';
import * as readline from 'readline';
import { ReactIDE } from '../../ReactIDE';
var bin = normalize(join(__dirname, '../../../../node_modules/.bin/tsserver' + (process.platform == 'win32' ? '.cmd' : '')));

type TSServerCommand = "brace"
    | "braceCompletion"
    | "getSpanOfEnclosingComment"
    | "change"
    | "close"
    | "completions"
    | "completionEntryDetails"
    | "compileOnSaveAffectedFileList"
    | "compileOnSaveEmitFile"
    | "configure"
    | "definition"
    | "definitionAndBoundSpan"
    | "implementation"
    | "exit"
    | "format"
    | "formatonkey"
    | "geterr"
    | "geterrForProject"
    | "semanticDiagnosticsSync"
    | "syntacticDiagnosticsSync"
    | "navbar"
    | "navto"
    | "navtree"
    | "navtree-full"
    | "occurrences"
    | "documentHighlights"
    | "open"
    | "quickinfo"
    | "references"
    | "reload"
    | "rename"
    | "saveto"
    | "signatureHelp"
    | "typeDefinition"
    | "projectInfo"
    | "reloadProjects"
    | "unknown"
    | "openExternalProject"
    | "openExternalProjects"
    | "closeExternalProject"
    | "todoComments"
    | "indentation"
    | "docCommentTemplate"
    | "compilerOptionsForInferredProjects"
    | "getCodeFixes"
    | "applyCodeActionCommand"
    | "getSupportedCodeFixes"
    | "getApplicableRefactors"
    | "getEditsForRefactor";

export class TSServerClient {
    private child_process: ChildProcess;
    private seq = 0;
    private callbacks: Array<(err: string, body) => void> = [];

    constructor() {
        this.child_process = spawn(bin);
        var { stdin, stdout } = this.child_process;
        var r = readline.createInterface(stdout, stdin);
        r.on('line', (text) => {
            if (text.charAt(0) == '{') {
                this.proc(text);
            }
        });
        ReactIDE.Window.on('close', () => this.child_process.kill());
    }

    cmd(name: TSServerCommand, args, cb?) {
        if(cb) {
            this.callbacks[++this.seq] = cb;
        }
        this.send({ "seq": cb ? this.seq : 0, "type": "quickinfo", "command": name, "arguments": args });
    }

    send(data) {
        this.child_process.stdin.write(JSON.stringify(data) + '\n');
    }

    proc(response: string) {
        var data = JSON.parse(response);
        if(data.request_seq) {
            console.log(data);
            if(data.success == false) {
                this.callbacks[data.request_seq] && this.callbacks[data.request_seq](data.message, null);
            } else {
                this.callbacks[data.request_seq] && this.callbacks[data.request_seq](null, data);
            }
        } else {
            console.log(data);
        }
    }
}