import { readFileSync } from "fs";
import * as ts from 'typescript';
import { Neutrino } from "../../Neutrino";
import { join } from "path";
import { Nuclear } from "../../Nuclear";

class Host implements ts.CompilerHost {
    _files: {[fileName: string]: ts.SourceFile} = {};
    getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void, shouldCreateNewSourceFile?: boolean): ts.SourceFile {
        return this._files[fileName];
    }
    getDefaultLibFileName(options: ts.CompilerOptions): string {
        return "/node_modules/typescript/lib/lib.d.ts";
    }
    writeFile() {

    }
    getCurrentDirectory(): string {
        return "/";
    }
    getDirectories(path: string): string[] {
        return [];
    }
    getCanonicalFileName(fileName: string): string {
        return fileName;
    }
    useCaseSensitiveFileNames(): boolean {
        return true;
    }
    getNewLine(): string {
        return '\n';
    }
    fileExists(fileName: string): boolean {
        return !!this._files[fileName];
    }
    readFile(fileName: string): string {
        return this._files[fileName].text;
    }
    addFile(fileName: string, contents: string) {
        this._files[fileName] = ts.createSourceFile(fileName, contents, ts.ScriptTarget.ES2015);
    }
}

export let h = new Host();

// h.addFile("/lib.d.ts", readFileSync('./node_modules/typescript/lib/lib.d.ts', 'utf8'));
// Neutrino.FileSystem.readdir(join(__dirname, '../../../../node_modules/typescript/lib'), (files) => {
//     for(var file of files) {
//         if(file.indexOf('.d.ts')>-1) {
//             Neutrino.FileSystem.readFile(join(__dirname, '../../../../node_modules/typescript/lib', file), (res) => {
//                 h.addFile("/node_modules/typescript/lib/" + file.split('/').slice(-1)[0], res);
//             })
//         }
//     }
// })

// Neutrino.FileSystem.find(join(Nuclear.getProjectRoot(), 'node_modules/@types/'), '.d.ts', async (files) => {
//     var progress = document.getElementById('progress') as HTMLProgressElement;

//     progress.max = files.length;

//     // console.log(files.find((file) => {
//     //     return ~file.indexOf('antd')
//     // }))

//     for(var file of files) {
//         await new Promise(resolve => {
//             // console.log(join(__dirname, '../../../../',file));
//             Neutrino.FileSystem.readFile(join(Nuclear.getProjectRoot(), '/node_modules/@types/', file), (res) => {
//                 h.addFile(join(Nuclear.getProjectRoot(), '/node_modules/@types/', file), res);
//                 progress.value++;
//                 resolve();
//             })
//         })
//     }
//     console.log("done");
// });

// Neutrino.FileSystem.readdir(join(__dirname, '../../../../node_modules/@types'), (dirs) => {
//     for(var dir of dirs) {
//         Neutrino.FileSystem.readdir(join(__dirname, '../../../../node_modules/@types', dir), (files) => {
//             for(var file of files) {
//                 if(file.indexOf('.d.ts')>-1) {
//                     Neutrino.FileSystem.readFile(join(__dirname, '../../../../node_modules/@types/', dir, file), (res) => {
//                         h.addFile("/node_modules/@types/"+dir+'/' + file.split('/').slice(-1)[0], res);
//                     })
//                 }
//             }
//         });
        // if(file.indexOf('.d.ts')>-1) {
        //     Neutrino.FileSystem.readFile(join(__dirname, '../../../../node_modules/typescript/lib', file), (res) => {
        //         h.addFile("/node_modules/typescript/lib/" + file.split('/').slice(-1)[0], res);
        //     })
        // }
//     }
// })
// h.addFile("/Dropdown.tsx", readFileSync('./src/js/renderer/components/Dropdown.tsx', 'utf8'));
// h.addFile("/Editor.tsx", readFileSync('./src/js/renderer/components/Editor.tsx', 'utf8'));
// h.addFile("/FileExplorer.tsx", readFileSync('./src/js/renderer/components/FileExplorer.tsx', 'utf8'));
// h.addFile("/TabBar.tsx", readFileSync('./src/js/renderer/components/TabBar.tsx', 'utf8'));
// h.addFile("/Toolbar.tsx", readFileSync('./src/js/renderer/components/Toolbar.tsx', 'utf8'));
// h.addFile("/node_modules/@types/react/index.d.ts", readFileSync('./node_modules/@types/react/index.d.ts', 'utf8'));

export let compile = (fileNames: string[]) => {
    let program = ts.createProgram(fileNames, {
        noEmitOnError: true, noImplicitAny: false,
        target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, types: ['react']
    }, h);
    let emitResult = program.emit();

    // let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
    var find = (node: ts.Node) => {
        if(node.kind == ts.SyntaxKind.ImportDeclaration) {
            ts.forEachChild(node, (node) => {
                console.log(fileNames[0].split('/').slice(0, -1).join('/'));
                
                console.log(node.kind === ts.SyntaxKind.StringLiteral && node.getText().slice(1, -1));
            })
        } else {
            ts.forEachChild(node, find);            
        }
    };
    ts.forEachChild(h.getSourceFile(fileNames[0], ts.ScriptTarget.ES2015), find);

    // allDiagnostics.forEach(diagnostic => {
    //     if (diagnostic.file) {
    //         let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
    //         let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    //         console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    //     }
    //     else {
    //         console.log(`${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
    //     }
    // });

    return [];
};