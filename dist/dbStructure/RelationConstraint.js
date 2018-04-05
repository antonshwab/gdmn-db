"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RelationConstraint {
    constructor(name, indexName, fields) {
        this.name = name;
        this.indexName = indexName;
        this.fields = fields;
    }
    loadField(data) {
        this.fields.push(data.RDB$FIELD_NAME);
    }
}
exports.RelationConstraint = RelationConstraint;
//# sourceMappingURL=RelationConstraint.js.map