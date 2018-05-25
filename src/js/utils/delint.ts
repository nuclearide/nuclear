import { readFileSync } from "fs";
import * as ts from "typescript";
import _ from "lodash";

export function delint(sourceFile: ts.SourceFile) {
    const result = {
        defaultExport: "",
        classNames: []
    };
    delintNode(sourceFile);

    function delintNode(node: ts.Node) {
        switch (node.kind) {
            case ts.SyntaxKind.DefaultKeyword:
                const defaultClassName = _.at(node.parent, 'name.escapedText')[0];
                console.log('default keyword', node);
                if (defaultClassName) {
                    console.log('default class declaration', defaultClassName)
                    result.defaultExport = defaultClassName;
                }
                break;
            case ts.SyntaxKind.ClassDeclaration:
                const className = _.at(node.name, 'escapedText')[0];
                if (className) {
                    console.log("class declaration", className);
                    result.classNames.push(className);
                    report(node, "class declaration found");
                };
        }

        ts.forEachChild(node, delintNode);
    }

    function report(node: ts.Node, message: string) {
        let { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        console.log(`${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`);
    }
    return result;
}