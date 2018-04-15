import { FieldType } from "./DBStructure";
export declare class Field {
    readonly fieldType: FieldType;
    readonly notNull: boolean;
    readonly defaultValue: string | null;
    constructor(fieldType: FieldType, notNull: boolean, defaultValue: string | null);
}
