import {IRDB$RELATIONCONSTRAINT} from "./DBStructure";

export class RelationConstraint {

    public readonly name: string;
    public readonly indexName: string;
    public readonly fields: string[];

    constructor(name: string, indexName: string, fields: string[]) {
        this.name = name;
        this.indexName = indexName;
        this.fields = fields;
    }

    public loadField(data: IRDB$RELATIONCONSTRAINT) {
        this.fields.push(data.RDB$FIELD_NAME);
    }
}
