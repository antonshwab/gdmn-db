"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Field {
    constructor(fieldType, notNull, defaultValue, fieldLength, fieldScale, validationSource, fieldSubType) {
        this.fieldType = fieldType;
        this.notNull = notNull;
        this.defaultValue = defaultValue;
        this.fieldLength = fieldLength;
        this.fieldScale = fieldScale;
        this.validationSource = validationSource;
        this.fieldSubType = fieldSubType;
    }
}
exports.Field = Field;
//# sourceMappingURL=Field.js.map