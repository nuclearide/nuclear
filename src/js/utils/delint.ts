import {readFileSync} from "fs";
import * as ts from "typescript";

export function delint(sourceFile: ts.SourceFile) {
    const result = {
        classNames: [],
    }
    delintNode(sourceFile);

    function delintNode(node: ts.Node) {
        switch (node.kind) {
            case ts.SyntaxKind.ClassDeclaration:
                console.log('class declaration', node.name.escapedText);
                result.classNames.push(node.name.escapedText);
                report(node, 'class declaration found');
        }

        ts.forEachChild(node, delintNode);
    }

    function report(node: ts.Node, message: string) {
        let { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        console.log(`${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`);
    }
    return result;
}