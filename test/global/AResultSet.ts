import {expect, should} from "chai";
import {AConnection, AConnectionPool, AResultSet, ATransaction, IDefaultConnectionPoolOptions} from "../../src";

export function resultSetTest(connectionPool: AConnectionPool<IDefaultConnectionPoolOptions>): void {
    describe("AResultSet", async () => {

        let globalConnection: AConnection;
        let globalTransaction: ATransaction;

        before(async () => {
            globalConnection = await connectionPool.get();
            globalTransaction = await globalConnection.startTransaction();

            await AConnection.executeTransaction({
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

            await AConnection.executeTransaction({
                connection: globalConnection,
                callback: async (transaction) => {
                    await AConnection.executePrepareStatement({
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

            expect(await resultSet.next()).to.equal(true);
            expect(resultSet.closed).to.equal(false);

            await resultSet.close();
            expect(resultSet.closed).to.equal(true);
        });

        it("read data (isNull)", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT * FROM TEST_TABLE",
                callback: async (resultSet) => {
                    while (await resultSet.next()) {
                        expect(resultSet.isNull("ID")).to.equal(false);
                        expect(resultSet.isNull("NAME")).to.equal(false);
                        expect(resultSet.isNull("DATETIME")).to.equal(false);
                        expect(resultSet.isNull("ONLYDATE")).to.equal(false);
                        expect(resultSet.isNull("ONLYTIME")).to.equal(false);
                        expect(resultSet.isNull("NULLVALUE")).to.equal(true);
                        expect(resultSet.isNull("TEXTBLOB")).to.equal(false);
                    }
                }
            });
        });

        it("read data (getAny)", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT * FROM TEST_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        expect(await resultSet.getAny("ID")).to.equal(dataItem.id);
                        expect(await resultSet.getAny("NAME")).to.equal(dataItem.name);
                        expect((await resultSet.getAny("DATETIME"))!.getTime()).to.equal(dataItem.dateTime.getTime());
                        expect((await resultSet.getAny("ONLYDATE"))!.getTime()).to.equal(dataItem.onlyDate.getTime());
                        expect((await resultSet.getAny("ONLYTIME"))!.getTime()).to.equal(dataItem.onlyTime.getTime());
                        should().not.exist(await resultSet.getAny("NULLVALUE"));
                        expect(await resultSet.getAny("TEXTBLOB")).to.equal(dataItem.textBlob);
                    }
                }
            });
        });

        it("read data (getBlob)", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT * FROM TEST_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        expect(await resultSet.getBlob("ID").asString()).to.equal("");
                        expect(await resultSet.getBlob("NAME").asString()).to.equal("");
                        expect(await resultSet.getBlob("DATETIME").asString()).to.equal("");
                        expect(await resultSet.getBlob("ONLYDATE").asString()).to.equal("");
                        expect(await resultSet.getBlob("ONLYTIME").asString()).to.equal("");
                        expect(await resultSet.getBlob("NULLVALUE").asString()).to.equal("");
                        expect(await resultSet.getBlob("TEXTBLOB").asString()).to.equal(dataItem.textBlob);
                    }
                }
            });
        });

        it("read data (getString)", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT * FROM TEST_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        expect(resultSet.getString("ID")).to.equal(dataItem.id.toString());
                        expect(resultSet.getString("NAME")).to.equal(dataItem.name);
                        expect(resultSet.getString("DATETIME")).to.equal(dataItem.dateTime.toString());
                        expect(resultSet.getString("ONLYDATE")).to.equal(dataItem.onlyDate.toString());
                        expect(resultSet.getString("ONLYTIME")).to.equal(dataItem.onlyTime.toString());
                        expect(resultSet.getString("NULLVALUE")).to.equal("");
                    }
                }
            });
        });

        it("read data (getNumber)", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT * FROM TEST_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        expect(resultSet.getNumber("ID")).to.equal(dataItem.id);
                        expect(isNaN(resultSet.getNumber("NAME"))).to.equal(true);
                        expect(isNaN(resultSet.getNumber("DATETIME"))).to.equal(true);
                        expect(isNaN(resultSet.getNumber("ONLYDATE"))).to.equal(true);
                        expect(isNaN(resultSet.getNumber("ONLYTIME"))).to.equal(true);
                        expect(resultSet.getNumber("NULLVALUE")).to.equal(0);
                    }
                }
            });
        });

        it("read data (getBoolean)", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT * FROM TEST_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        expect(resultSet.getBoolean("ID")).to.equal(i !== 0);
                        expect(resultSet.getBoolean("NAME")).to.equal(true);
                        expect(resultSet.getBoolean("DATETIME")).to.equal(true);
                        expect(resultSet.getBoolean("ONLYDATE")).to.equal(true);
                        expect(resultSet.getBoolean("ONLYTIME")).to.equal(true);
                        expect(resultSet.getBoolean("NULLVALUE")).to.equal(false);
                    }
                }
            });
        });

        it("read data (getDate)", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT * FROM TEST_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        should().exist(resultSet.getDate("ID"));
                        should().not.exist(resultSet.getDate("NAME"));
                        expect(resultSet.getDate("DATETIME")!.getTime()).to.equal(dataItem.dateTime.getTime());
                        expect(resultSet.getDate("ONLYDATE")!.getTime()).to.equal(dataItem.onlyDate.getTime());
                        expect(resultSet.getDate("ONLYTIME")!.getTime()).to.equal(dataItem.onlyTime.getTime());
                        should().not.exist(resultSet.getDate("NULLVALUE"));
                    }
                }
            });
        });
    });
}

interface IDataItem {
    id: number;
    name: string;
    dateTime: Date;
    onlyDate: Date;
    onlyTime: Date;
    nullValue: null;
    textBlob: string;
}

const arrayData = getData(10);

function getData(count: number): IDataItem[] {
    const dateTime = new Date();
    const onlyDate = new Date();
    onlyDate.setHours(0, 0, 0, 0);
    const onlyTime = new Date();

    const data: IDataItem[] = [];
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
