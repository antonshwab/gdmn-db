import { IRDB$RELATIONCONSTRAINT, IRDB$RELATIONFIELD } from "./DBStructure";
import { FKConstraint } from "./FKConstraint";
import { RelationConstraint } from "./RelationConstraint";
import { RelationField } from "./RelationField";
export interface IRelationFields {
    [name: string]: RelationField;
}
export interface IRefConstraints {
    [name: string]: FKConstraint;
}
export interface IUqConstraints {
    [name: string]: RelationConstraint;
}
export declare class Relation {
    readonly name: string;
    private _relationFields;
    private _primaryKey;
    private _foreignKeys;
    private _unique;
    constructor(name: string);
    readonly primaryKey: RelationConstraint | null;
    readonly foreignKeys: IRefConstraints;
    readonly unique: IUqConstraints;
    loadField(field: IRDB$RELATIONFIELD): void;
    loadConstraintField(constraint: IRDB$RELATIONCONSTRAINT): void;
}
