"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const src_1 = require("../../src");
function resultSetTest(connectionPool) {
    describe("AResultSet", async () => {
        let globalConnection;
        let globalTransaction;
        before(async () => {
            globalConnection = await connectionPool.get();
            globalTransaction = await globalConnection.startTransaction();
            await src_1.AConnection.executeTransaction({
                connection: globalConnection,
                callback: async (transaction) => {
                    await globalConnection.execute(transaction, `
                    CREATE TABLE TEST_TABLE (
                        id              INT NOT NULL PRIMARY KEY,
                        name            VARCHAR(20)  NOT NULL,
                        dateTime        TIMESTAMP NOT NULL,
                        onlyDate        DATE NOT NULL,
                        onlyTime        TIME NOT NULL,
                        nullValue       VARCHAR(20),
                        textBlob        BLOB SUB_TYPE TEXT NOT NULL
                    )
                `);
                }
            });
            await src_1.AConnection.executeTransaction({
                connection: globalConnection,
                callback: async (transaction) => {
                    await src_1.AConnection.executePrepareStatement({
                        connection: globalConnection,
                        transaction,
                        sql: `
                        INSERT INTO TEST_TABLE (id, name, dateTime, onlyDate, onlyTime, nullValue, textBlob)
                        VALUES(:id, :name, :dateTime, :onlyDate, :onlyTime, :nullValue, :textBlob)
                    `, callback: async (statement) => {
                            for (const item of arrayData) {
                                await statement.execute(item);
                            }
                        }
                    });
                }
            });
        });
        after(async () => {
            await globalConnection.execute(globalTransaction, "DROP TABLE TEST_TABLE");
            await globalTransaction.commit();
            await globalConnection.disconnect();
        });
        it("lifecycle", async () => {
            const resultSet = await globalConnection
                .executeQuery(globalTransaction, "SELECT FIRST 1 * FROM TEST_TABLE");
            chai_1.expect(await resultSet.next()).to.equal(true);
            chai_1.expect(resultSet.closed).to.equal(false);
            await resultSet.close();
            chai_1.expect(resultSet.closed).to.equal(true);
        });
        it("read data (isNull) with params", async () => {
            await src_1.AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST :count * FROM TEST_TABLE",
                params: { count: 1000 },
                type: src_1.CursorType.FORWARD_ONLY,
                callback: async (resultSet) => {
                    while (await resultSet.next()) {
                        chai_1.expect(resultSet.isNull("ID")).to.equal(false);
                        chai_1.expect(resultSet.isNull("NAME")).to.equal(false);
                        chai_1.expect(resultSet.isNull("DATETIME")).to.equal(false);
                        chai_1.expect(resultSet.isNull("ONLYDATE")).to.equal(false);
                        chai_1.expect(resultSet.isNull("ONLYTIME")).to.equal(false);
                        chai_1.expect(resultSet.isNull("NULLVALUE")).to.equal(true);
                        chai_1.expect(resultSet.isNull("TEXTBLOB")).to.equal(false);
                    }
                }
            });
        });
        it("read data (isNull)", async () => {
            await src_1.AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT * FROM TEST_TABLE",
                callback: async (resultSet) => {
                    while (await resultSet.next()) {
                        chai_1.expect(resultSet.isNull("ID")).to.equal(false);
                        chai_1.expect(resultSet.isNull("NAME")).to.equal(false);
                        chai_1.expect(resultSet.isNull("DATETIME")).to.equal(false);
                        chai_1.expect(resultSet.isNull("ONLYDATE")).to.equal(false);
                        chai_1.expect(resultSet.isNull("ONLYTIME")).to.equal(false);
                        chai_1.expect(resultSet.isNull("NULLVALUE")).to.equal(true);
                        chai_1.expect(resultSet.isNull("TEXTBLOB")).to.equal(false);
                    }
                }
            });
        });
        it("read data (getAny)", async () => {
            await src_1.AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT * FROM TEST_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        chai_1.expect(await resultSet.getAny("ID")).to.equal(dataItem.id);
                        chai_1.expect(await resultSet.getAny("NAME")).to.equal(dataItem.name);
                        chai_1.expect((await resultSet.getAny("DATETIME")).getTime()).to.equal(dataItem.dateTime.getTime());
                        chai_1.expect((await resultSet.getAny("ONLYDATE")).getTime()).to.equal(dataItem.onlyDate.getTime());
                        chai_1.expect((await resultSet.getAny("ONLYTIME")).getTime()).to.equal(dataItem.onlyTime.getTime());
                        chai_1.should().not.exist(await resultSet.getAny("NULLVALUE"));
                        chai_1.expect(await resultSet.getAny("TEXTBLOB")).to.equal(dataItem.textBlob);
                    }
                }
            });
        });
        it("read data (getBlob)", async () => {
            await src_1.AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT * FROM TEST_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        chai_1.expect(await resultSet.getBlob("ID").asString()).to.equal("");
                        chai_1.expect(await resultSet.getBlob("NAME").asString()).to.equal("");
                        chai_1.expect(await resultSet.getBlob("DATETIME").asString()).to.equal("");
                        chai_1.expect(await resultSet.getBlob("ONLYDATE").asString()).to.equal("");
                        chai_1.expect(await resultSet.getBlob("ONLYTIME").asString()).to.equal("");
                        chai_1.expect(await resultSet.getBlob("NULLVALUE").asString()).to.equal("");
                        chai_1.expect(await resultSet.getBlob("TEXTBLOB").asString()).to.equal(dataItem.textBlob);
                    }
                }
            });
        });
        it("read data (getString)", async () => {
            await src_1.AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT * FROM TEST_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        chai_1.expect(resultSet.getString("ID")).to.equal(dataItem.id.toString());
                        chai_1.expect(resultSet.getString("NAME")).to.equal(dataItem.name);
                        chai_1.expect(resultSet.getString("DATETIME")).to.equal(dataItem.dateTime.toString());
                        chai_1.expect(resultSet.getString("ONLYDATE")).to.equal(dataItem.onlyDate.toString());
                        chai_1.expect(resultSet.getString("ONLYTIME")).to.equal(dataItem.onlyTime.toString());
                        chai_1.expect(resultSet.getString("NULLVALUE")).to.equal("");
                    }
                }
            });
        });
        it("read data (getNumber)", async () => {
            await src_1.AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT * FROM TEST_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        chai_1.expect(resultSet.getNumber("ID")).to.equal(dataItem.id);
                        chai_1.expect(isNaN(resultSet.getNumber("NAME"))).to.equal(true);
                        chai_1.expect(isNaN(resultSet.getNumber("DATETIME"))).to.equal(true);
                        chai_1.expect(isNaN(resultSet.getNumber("ONLYDATE"))).to.equal(true);
                        chai_1.expect(isNaN(resultSet.getNumber("ONLYTIME"))).to.equal(true);
                        chai_1.expect(resultSet.getNumber("NULLVALUE")).to.equal(0);
                    }
                }
            });
        });
        it("read data (getBoolean)", async () => {
            await src_1.AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT * FROM TEST_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        chai_1.expect(resultSet.getBoolean("ID")).to.equal(i !== 0);
                        chai_1.expect(resultSet.getBoolean("NAME")).to.equal(true);
                        chai_1.expect(resultSet.getBoolean("DATETIME")).to.equal(true);
                        chai_1.expect(resultSet.getBoolean("ONLYDATE")).to.equal(true);
                        chai_1.expect(resultSet.getBoolean("ONLYTIME")).to.equal(true);
                        chai_1.expect(resultSet.getBoolean("NULLVALUE")).to.equal(false);
                    }
                }
            });
        });
        it("read data (getDate)", async () => {
            await src_1.AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT * FROM TEST_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        chai_1.should().exist(resultSet.getDate("ID"));
                        chai_1.should().not.exist(resultSet.getDate("NAME"));
                        chai_1.expect(resultSet.getDate("DATETIME").getTime()).to.equal(dataItem.dateTime.getTime());
                        chai_1.expect(resultSet.getDate("ONLYDATE").getTime()).to.equal(dataItem.onlyDate.getTime());
                        chai_1.expect(resultSet.getDate("ONLYTIME").getTime()).to.equal(dataItem.onlyTime.getTime());
                        chai_1.should().not.exist(resultSet.getDate("NULLVALUE"));
                    }
                }
            });
        });
    });
}
exports.resultSetTest = resultSetTest;
const arrayData = getData(10);
function getData(count) {
    const dateTime = new Date();
    const onlyDate = new Date();
    onlyDate.setHours(0, 0, 0, 0);
    const onlyTime = new Date();
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({
            id: i,
            name: `Name №${i + 1}`,
            dateTime,
            onlyDate,
            onlyTime,
            nullValue: null,
            textBlob: "Test text blob field"
        });
    }
    return data;
}
//# sourceMappingURL=AResultSet.js.map