export declare class RelationField {
    readonly name: string;
    readonly fieldSource: string;
    readonly notNull: boolean;
    readonly defaultValue: string | null;
    readonly defaultSource: string | null;
    constructor(name: string, fieldSource: string, notNull: boolean, defaultValue: string | null, defaultSource: string | null);
}
