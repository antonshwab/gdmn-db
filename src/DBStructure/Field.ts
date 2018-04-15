import {FieldType} from "./DBStructure";

export class Field {

    public readonly fieldType: FieldType;
    public readonly notNull: boolean;
    public readonly defaultValue: string | null;

    constructor(fieldType: FieldType, notNull: boolean, defaultValue: string | null) {
        this.fieldType = fieldType;
        this.notNull = notNull;
        this.defaultValue = defaultValue;
    }
}
