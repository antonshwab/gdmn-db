"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RelationConstraint_1 = require("./RelationConstraint");
class FKConstraint extends RelationConstraint_1.RelationConstraint {
    constructor(name, indexName, fields, constNameUq, updateRule, deleteRule) {
        super(name, indexName, fields);
        this.constNameUq = constNameUq;
        this.updateRule = updateRule;
        this.deleteRule = deleteRule;
    }
}
exports.FKConstraint = FKConstraint;
//# sourceMappingURL=FKConstraint.js.map