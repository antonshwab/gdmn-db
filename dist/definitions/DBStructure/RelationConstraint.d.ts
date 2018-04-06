import { IRDB$RELATIONCONSTRAINT } from "./DBStructure";
export declare class RelationConstraint {
    readonly name: string;
    readonly indexName: string;
    readonly fields: string[];
    constructor(name: string, indexName: string, fields: string[]);
    loadField(data: IRDB$RELATIONCONSTRAINT): void;
}
