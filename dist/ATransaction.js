"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AccessMode;
(function (AccessMode) {
    AccessMode["READ_WRITE"] = "READ_WRITE";
    AccessMode["READ_ONLY"] = "READ_ONLY";
})(AccessMode = exports.AccessMode || (exports.AccessMode = {}));
var Isolation;
(function (Isolation) {
    Isolation["READ_COMMITED"] = "READ_COMMITED";
    Isolation["READ_UNCOMMITED"] = "READ_UNCOMMITED";
    Isolation["REPEATABLE_READ"] = "REPEATABLE_READ";
    Isolation["SERIALIZABLE"] = "SERIALIZABLE";
})(Isolation = exports.Isolation || (exports.Isolation = {}));
/**
 * The transaction object
 */
class ATransaction {
    constructor(connection, options) {
        this._connection = connection;
        this._options = Object.assign({}, ATransaction.DEFAULT_OPTIONS, options);
    }
    get connection() {
        return this._connection;
    }
    /** Transaction type */
    get options() {
        return this._options;
    }
    static async executeSelf(selfReceiver, callback) {
        let self;
        try {
            self = await selfReceiver(null);
            const result = await callback(self);
            await self.commit();
            return result;
        }
        catch (error) {
            if (self) {
                await self.rollback();
            }
            throw error;
        }
    }
}
ATransaction.DEFAULT_OPTIONS = {
    isolation: Isolation.READ_COMMITED,
    accessMode: AccessMode.READ_WRITE
};
exports.ATransaction = ATransaction;
//# sourceMappingURL=ATransaction.js.map