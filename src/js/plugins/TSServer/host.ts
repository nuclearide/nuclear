import {LanguageServiceHost, getDefaultCompilerOptions, ScriptSnapshot, createLanguageService, getDefaultLibFileName, IScriptSnapshot, JsxEmit, ModuleKind, ScriptTarget} from 'typescript';
import { readFileSync } from 'fs';

interface ScriptInfo {
    version: string;
    snapshot: IScriptSnapshot;
}

export class TypescriptLanguageServiceHost implements LanguageServiceHost {
    files: {[name: string]: ScriptInfo} = {};

    getCompilationSettings() {
        var options = getDefaultCompilerOptions();
        options = {
            "jsx": JsxEmit.React,
            // "rootDir": "src",
            "outDir": "dist",
            "target": ScriptTarget.ES2016,
            "module": ModuleKind.CommonJS,
            "types": [
                "/node_modules/@types/node/index.d.ts"
            ]
        };
        return options;
    }
    getScriptFileNames() {
        return Object.keys(this.files);
    }
    getScriptVersion(fileName: string) {
        return this.files[fileName].version;
    }
    getScriptSnapshot(fileName: string) {
        if(this.files[fileName]) {
            return this.files[fileName].snapshot;
        }
    }
    getCurrentDirectory() {
        return '/';
    }
    getDefaultLibFileName() {
        return getDefaultLibFileName(this.getCompilationSettings());
    }
    addFile(name, text) {
        this.files[name] = {version: "1", snapshot: ScriptSnapshot.fromString(text)};
    }
    updateFile(name, text) {
        this.files[name] = {
            version: this.files[name].version+1,
            snapshot: ScriptSnapshot.fromString(text)
        }
    }
}