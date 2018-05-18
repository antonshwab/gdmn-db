"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AccessMode;
(function (AccessMode) {
    AccessMode[AccessMode["READ_WRITE"] = 0] = "READ_WRITE";
    AccessMode[AccessMode["READ_ONLY"] = 1] = "READ_ONLY";
})(AccessMode = exports.AccessMode || (exports.AccessMode = {}));
var Isolation;
(function (Isolation) {
    Isolation[Isolation["READ_COMMITED"] = 0] = "READ_COMMITED";
    Isolation[Isolation["READ_UNCOMMITED"] = 1] = "READ_UNCOMMITED";
    Isolation[Isolation["REPEATABLE_READ"] = 2] = "REPEATABLE_READ";
    Isolation[Isolation["SERIALIZABLE"] = 3] = "SERIALIZABLE";
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