import { DeleteRule, UpdateRule } from "./DBStructure";
import { RelationConstraint } from "./RelationConstraint";
export declare class FKConstraint extends RelationConstraint {
    readonly constNameUq: string;
    readonly updateRule: UpdateRule;
    readonly deleteRule: DeleteRule;
    constructor(name: string, indexName: string, fields: string[], constNameUq: string, updateRule: UpdateRule, deleteRule: DeleteRule);
}
