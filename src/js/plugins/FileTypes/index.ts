import { Nuclear } from "../../Nuclear";

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
    },
    {
        match: /\.html/,
        type: {
            name: "htmlmixed",
            tags: {
                style: [["type", /^text\/(x-)?scss$/, "text/x-scss"],
                [null, null, "css"]],
                custom: [[null, null, "customMode"]]
            }
        }
    }
]

export default class FileTypes {
    onLoad() {
        types.forEach(type => Nuclear.FileTypes.add(type.match, type.type));
    }
    onUnload() {
        types.forEach(type => Nuclear.FileTypes.remove(type.match, type.type));
    }
}