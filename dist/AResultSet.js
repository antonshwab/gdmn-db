"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AResultSet {
    static async executeFromParent(sourceCallback, resultCallback) {
        let resultSet;
        try {
            resultSet = await sourceCallback(null);
            return await resultCallback(resultSet);
        }
        finally {
            if (resultSet) {
                await resultSet.close();
            }
        }
    }
}
exports.AResultSet = AResultSet;
//# sourceMappingURL=AResultSet.js.map