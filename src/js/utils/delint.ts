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
            case ts.SyntaxKind.ExportAssignment:
                console.log("[DELINt] found export default assignment", node)
                const className = node.expression.escapedText;
                result.defaultExport = className;
                result.classNames.push(className);
                break;
            case ts.SyntaxKind.NamedExports:
                console.log("[DELINt] at kindexport named exports", node)
                node.elements.forEach(e => result.classNames.push(e.name.escapedText))
                break;
        }
        switch (ts.getCombinedModifierFlags(node)) {
            case ts.ModifierFlags.ExportDefault:
                const defaultClassName = _.at(node.name, 'escapedText')[0];
                console.log('[DELINt] found export default declaration', node);
                if (defaultClassName) {
                    console.log('default class declaration', defaultClassName)
                    result.defaultExport = defaultClassName;
                    result.classNames.push(defaultClassName);
                }
                break;
            case ts.ModifierFlags.Export:
                const className = _.at(node.name, 'escapedText')[0];
                console.log('[DELINt] class export declaration', node)
                if (className) {
                    console.log("class declaration", className);
                    result.classNames.push(className);
                    report(node, "class declaration found");
                }
                break;
        }

        ts.forEachChild(node, delintNode);
    }

    function report(node: ts.Node, message: string) {
        let { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        console.log(`${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`);
    }
    return result;
}