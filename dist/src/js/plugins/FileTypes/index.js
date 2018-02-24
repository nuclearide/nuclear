"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReactIDE_1 = require("../../ReactIDE");
var types = [
    {
        match: /\.txt/,
        type: 'text/plain'
    },
    {
        match: /\.tsx/,
        type: 'text/typescript-jsx'
    },
    {
        match: /\.ts/,
        type: 'text/typescript'
    }
];
class FileTypes {
    onLoad() {
        types.forEach(type => ReactIDE_1.ReactIDE.FileTypes.add(type.match, type.type));
    }
    onUnload() {
        types.forEach(type => ReactIDE_1.ReactIDE.FileTypes.remove(type.match, type.type));
    }
}
exports.default = FileTypes;
