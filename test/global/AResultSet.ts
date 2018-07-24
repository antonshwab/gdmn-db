import {AConnection, AConnectionPool, ATransaction, CursorType, IDefaultConnectionPoolOptions} from "../../src";

export function resultSetTest(connectionPool: AConnectionPool<IDefaultConnectionPoolOptions>): void {
    describe("AResultSet", async () => {

        let globalConnection: AConnection;
        let globalTransaction: ATransaction;

        beforeAll(async () => {
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
                            RETURNING id, name, dateTime, onlyDate, onlyTime, nullValue, textBlob
                        `, callback: async (statement) => {
                            for (const dataItem of arrayData) {
                                const result = await statement.executeReturning(dataItem);
                                expect(await result.getAny("ID")).toBe(dataItem.id);
                                expect(await result.getAny("NAME")).toBe(dataItem.name);
                                expect((await result.getAny("DATETIME"))!.getTime())
                                    .toBe(dataItem.dateTime.getTime());
                                expect((await result.getAny("ONLYDATE"))!.getTime())
                                    .toBe(dataItem.onlyDate.getTime());
                                expect((await result.getAny("ONLYTIME"))!.getTime())
                                    .toBe(dataItem.onlyTime.getTime());
                                expect(await result.getAny("NULLVALUE")).toBeNull();
                                expect(await result.getAny("TEXTBLOB")).toBe(dataItem.textBlob);
                            }
                        }
                    });
                }
            });
        });

        afterAll(async () => {
            await globalConnection.execute(globalTransaction, "DROP TABLE TEST_TABLE");
            await globalTransaction.commit();
            await globalConnection.disconnect();
        });

        it("lifecycle", async () => {
            const resultSet = await globalConnection
                .executeQuery(globalTransaction, "SELECT FIRST 1 * FROM TEST_TABLE");

            expect(await resultSet.next()).toBeTruthy();
            expect(resultSet.closed).toBeFalsy();

            await resultSet.close();
            expect(resultSet.closed).toBeTruthy();
        });

        it("read data (isNull) with params", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST :count * FROM TEST_TABLE",
                params: {count: 1000},
                type: CursorType.FORWARD_ONLY,
                callback: async (resultSet) => {
                    while (await resultSet.next()) {
                        expect(resultSet.isNull("ID")).toBe(false);
                        expect(resultSet.isNull("NAME")).toBe(false);
                        expect(resultSet.isNull("DATETIME")).toBe(false);
                        expect(resultSet.isNull("ONLYDATE")).toBe(false);
                        expect(resultSet.isNull("ONLYTIME")).toBe(false);
                        expect(resultSet.isNull("NULLVALUE")).toBe(true);
                        expect(resultSet.isNull("TEXTBLOB")).toBe(false);
                    }
                }
            });
        });

        it("read data (isNull)", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT * FROM TEST_TABLE",
                callback: async (resultSet) => {
                    while (await resultSet.next()) {
                        expect(resultSet.isNull("ID")).toBe(false);
                        expect(resultSet.isNull("NAME")).toBe(false);
                        expect(resultSet.isNull("DATETIME")).toBe(false);
                        expect(resultSet.isNull("ONLYDATE")).toBe(false);
                        expect(resultSet.isNull("ONLYTIME")).toBe(false);
                        expect(resultSet.isNull("NULLVALUE")).toBe(true);
                        expect(resultSet.isNull("TEXTBLOB")).toBe(false);
                    }
                }
            });
        });

        it("read data (getAll)", async () => {
            await AConnection.executeQueryResultSet({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT * FROM TEST_TABLE",
                callback: async (resultSet) => {
                    for (let i = 0; await resultSet.next(); i++) {
                        const dataItem = arrayData[i];
                        const result = await resultSet.getAll();
                        expect(result[0]).toBe(dataItem.id);
                        expect(result[1]).toBe(dataItem.name);
                        expect(result[2].getTime()).toBe(dataItem.dateTime.getTime());
                        expect(result[3].getTime()).toBe(dataItem.onlyDate.getTime());
                        expect(result[4].getTime()).toBe(dataItem.onlyTime.getTime());
                        expect(result[5]).toBeNull();
                        expect(result[6]).toBe(dataItem.textBlob);
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
                        expect(await resultSet.getAny("ID")).toBe(dataItem.id);
                        expect(await resultSet.getAny("NAME")).toBe(dataItem.name);
                        expect((await resultSet.getAny("DATETIME"))!.getTime()).toBe(dataItem.dateTime.getTime());
                        expect((await resultSet.getAny("ONLYDATE"))!.getTime()).toBe(dataItem.onlyDate.getTime());
                        expect((await resultSet.getAny("ONLYTIME"))!.getTime()).toBe(dataItem.onlyTime.getTime());
                        expect(await resultSet.getAny("NULLVALUE")).toBeNull();
                        expect(await resultSet.getAny("TEXTBLOB")).toBe(dataItem.textBlob);
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
                        expect(await resultSet.getBlob("ID").asString()).toBe("");
                        expect(await resultSet.getBlob("NAME").asString()).toBe("");
                        expect(await resultSet.getBlob("DATETIME").asString()).toBe("");
                        expect(await resultSet.getBlob("ONLYDATE").asString()).toBe("");
                        expect(await resultSet.getBlob("ONLYTIME").asString()).toBe("");
                        expect(await resultSet.getBlob("NULLVALUE").asString()).toBe("");
                        expect(await resultSet.getBlob("TEXTBLOB").asString()).toBe(dataItem.textBlob);
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
                        expect(resultSet.getString("ID")).toBe(dataItem.id.toString());
                        expect(resultSet.getString("NAME")).toBe(dataItem.name);
                        expect(resultSet.getString("DATETIME")).toBe(dataItem.dateTime.toString());
                        expect(resultSet.getString("ONLYDATE")).toBe(dataItem.onlyDate.toString());
                        expect(resultSet.getString("ONLYTIME")).toBe(dataItem.onlyTime.toString());
                        expect(resultSet.getString("NULLVALUE")).toBe("");
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
                        expect(resultSet.getNumber("ID")).toBe(dataItem.id);
                        expect(isNaN(resultSet.getNumber("NAME"))).toBe(true);
                        expect(isNaN(resultSet.getNumber("DATETIME"))).toBe(true);
                        expect(isNaN(resultSet.getNumber("ONLYDATE"))).toBe(true);
                        expect(isNaN(resultSet.getNumber("ONLYTIME"))).toBe(true);
                        expect(resultSet.getNumber("NULLVALUE")).toBe(0);
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
                        expect(resultSet.getBoolean("ID")).toBe(i !== 0);
                        expect(resultSet.getBoolean("NAME")).toBe(true);
                        expect(resultSet.getBoolean("DATETIME")).toBe(true);
                        expect(resultSet.getBoolean("ONLYDATE")).toBe(true);
                        expect(resultSet.getBoolean("ONLYTIME")).toBe(true);
                        expect(resultSet.getBoolean("NULLVALUE")).toBe(false);
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
                        expect(resultSet.getDate("ID")).toBeTruthy();
                        expect(resultSet.getDate("NAME")).toBeNull();
                        expect(resultSet.getDate("DATETIME")!.getTime()).toBe(dataItem.dateTime.getTime());
                        expect(resultSet.getDate("ONLYDATE")!.getTime()).toBe(dataItem.onlyDate.getTime());
                        expect(resultSet.getDate("ONLYTIME")!.getTime()).toBe(dataItem.onlyTime.getTime());
                        expect(resultSet.getDate("NULLVALUE")).toBeNull();
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
