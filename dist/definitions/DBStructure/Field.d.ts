import { FieldType } from "./DBStructure";
export declare class Field {
    readonly fieldType: FieldType;
    readonly notNull: boolean;
    constructor(fieldType: FieldType, notNull: boolean);
}
