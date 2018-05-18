"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
function transactionTest(connectionPool) {
    describe("ATransaction", async () => {
        let globalConnection;
        before(async () => {
            globalConnection = await connectionPool.get();
        });
        after(async () => {
            await globalConnection.disconnect();
        });
        it("lifecycle", async () => {
            let transaction = await globalConnection.startTransaction();
            chai_1.expect(transaction.finished).to.equal(false);
            await transaction.commit();
            chai_1.expect(transaction.finished).to.equal(true);
            transaction = await globalConnection.startTransaction();
            chai_1.expect(transaction.finished).to.equal(false);
            await transaction.rollback();
            chai_1.expect(transaction.finished).to.equal(true);
        });
    });
}
exports.transactionTest = transactionTest;
//# sourceMappingURL=ATransaction.js.map