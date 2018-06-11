import { ADD_PROP_TYPES } from "../components/AddPropsModal";

export function filterProp(prop: { name, value, type: ADD_PROP_TYPES }) {
    switch(prop.type) {
        case ADD_PROP_TYPES.BOOLEAN:
            return `${prop.name}={${prop.value ? true : false}}`;
        case ADD_PROP_TYPES.NUMBER:
            return `${prop.name}={${Number(prop.value)}}`
        default:
            return `${prop.name}={'${String(prop.value)}'}`
    }
}