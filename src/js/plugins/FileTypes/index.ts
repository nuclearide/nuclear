import { ReactIDE } from "../../ReactIDE";

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
]

export default class FileTypes {
    onLoad() {
        types.forEach(type => ReactIDE.FileTypes.add(type.match, type.type));
    }
    onUnload() {
        types.forEach(type => ReactIDE.FileTypes.remove(type.match, type.type));
    }
}