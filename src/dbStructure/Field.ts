import {FieldType} from "./DBStructure";

export class Field {

    public readonly fieldType: FieldType;
    public readonly notNull: boolean;

    constructor(fieldType: FieldType, notNull: boolean) {
        this.fieldType = fieldType;
        this.notNull = notNull;
    }
}
