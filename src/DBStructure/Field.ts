import {FieldType} from "./DBStructure";

export class Field {

    public readonly fieldType: FieldType;
    public readonly notNull: boolean;
    public readonly defaultValue: string | null;
    public readonly fieldLength: number;
    public readonly fieldScale: number;
    public readonly validationSource: string | null;
    public readonly fieldSubType: number | null;

    constructor(fieldType: FieldType, notNull: boolean, defaultValue: string | null,
      fieldLength: number, fieldScale: number, validationSource: string | null,
      fieldSubType: number | null)
    {
        this.fieldType = fieldType;
        this.notNull = notNull;
        this.defaultValue = defaultValue;
        this.fieldLength = fieldLength;
        this.fieldScale = fieldScale;
        this.validationSource = validationSource;
        this.fieldSubType = fieldSubType;
    }
}
