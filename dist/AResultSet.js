"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AResult_1 = require("./AResult");
var CursorType;
(function (CursorType) {
    CursorType[CursorType["FORWARD_ONLY"] = 0] = "FORWARD_ONLY";
    CursorType[CursorType["SCROLLABLE"] = 1] = "SCROLLABLE";
})(CursorType = exports.CursorType || (exports.CursorType = {}));
class AResultSet extends AResult_1.AResult {
    constructor(statement, type = AResultSet.DEFAULT_TYPE) {
        super(statement);
        this._type = type;
    }
    get type() {
        return this._type;
    }
    static async executeSelf(selfReceiver, callback) {
        let self;
        try {
            self = await selfReceiver(null);
            return await callback(self);
        }
        finally {
            if (self) {
                await self.close();
            }
        }
    }
}
AResultSet.DEFAULT_TYPE = CursorType.FORWARD_ONLY;
exports.AResultSet = AResultSet;
//# sourceMappingURL=AResultSet.js.map