import { FieldType } from "./DBStructure";
export declare class Field {
    readonly fieldType: FieldType;
    readonly notNull: boolean;
    readonly defaultValue: string | null;
    readonly fieldLength: number;
    readonly fieldScale: number;
    readonly validationSource: string | null;
    readonly fieldSubType: number | null;
    readonly fieldPrecision: number;
    constructor(fieldType: FieldType, notNull: boolean, defaultValue: string | null, fieldLength: number, fieldScale: number, validationSource: string | null, fieldSubType: number | null, fieldPrecision: number);
}
