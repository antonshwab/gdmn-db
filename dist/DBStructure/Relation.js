"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FKConstraint_1 = require("./FKConstraint");
const RelationConstraint_1 = require("./RelationConstraint");
const RelationField_1 = require("./RelationField");
class Relation {
    constructor(name) {
        this.name = name;
        this._relationFields = {};
        this._primaryKey = null;
        this._foreignKeys = {};
        this._unique = {};
    }
    get relationFields() {
        return this._relationFields;
    }
    get primaryKey() {
        return this._primaryKey;
    }
    get foreignKeys() {
        return this._foreignKeys;
    }
    get unique() {
        return this._unique;
    }
    loadField(field) {
        this._relationFields[field.RDB$FIELD_NAME] = new RelationField_1.RelationField(field.RDB$FIELD_NAME, field.RDB$FIELD_SOURCE, !!field.RDB$NULL_FLAG, field.RDB$DEFAULT_VALUE, field.RDB$DEFAULT_SOURCE);
    }
    loadConstraintField(constraint) {
        switch (constraint.RDB$CONSTRAINT_TYPE) {
            case "PRIMARY KEY":
                if (!this._primaryKey) {
                    this._primaryKey = new RelationConstraint_1.RelationConstraint(constraint.RDB$CONSTRAINT_NAME, constraint.RDB$INDEX_NAME, [constraint.RDB$FIELD_NAME]);
                }
                else {
                    this._primaryKey.loadField(constraint);
                }
                break;
            case "FOREIGN KEY":
                if (!this._foreignKeys[constraint.RDB$CONSTRAINT_NAME]) {
                    this._foreignKeys[constraint.RDB$CONSTRAINT_NAME] = new FKConstraint_1.FKConstraint(constraint.RDB$CONSTRAINT_NAME, constraint.RDB$INDEX_NAME, [constraint.RDB$FIELD_NAME], constraint.RDB$CONST_NAME_UQ, constraint.RDB$UPDATE_RULE, constraint.RDB$DELETE_RULE);
                }
                else {
                    this._foreignKeys[constraint.RDB$CONSTRAINT_NAME].loadField(constraint);
                }
                break;
            case "UNIQUE":
                if (!this.unique[constraint.RDB$CONSTRAINT_NAME]) {
                    this.unique[constraint.RDB$CONSTRAINT_NAME] = new RelationConstraint_1.RelationConstraint(constraint.RDB$CONSTRAINT_NAME, constraint.RDB$INDEX_NAME, [constraint.RDB$FIELD_NAME]);
                }
                else {
                    this.unique[constraint.RDB$CONSTRAINT_NAME].loadField(constraint);
                }
        }
    }
}
exports.Relation = Relation;
//# sourceMappingURL=Relation.js.map