export class RelationField {

    public readonly name: string;
    public readonly fieldSource: string;
    public readonly notNull: boolean;

    constructor(name: string, fieldSource: string, notNull: boolean) {
        this.name = name;
        this.fieldSource = fieldSource;
        this.notNull = notNull;
    }
}
