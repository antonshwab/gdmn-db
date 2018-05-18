"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Field {
    constructor(fieldType, notNull, defaultValue, fieldLength, fieldScale, validationSource, fieldSubType, fieldPrecision) {
        this.fieldType = fieldType;
        this.notNull = notNull;
        this.defaultValue = defaultValue;
        this.fieldLength = fieldLength;
        this.fieldScale = fieldScale;
        this.validationSource = validationSource;
        this.fieldSubType = fieldSubType;
        this.fieldPrecision = fieldPrecision;
    }
}
exports.Field = Field;
//# sourceMappingURL=Field.js.map