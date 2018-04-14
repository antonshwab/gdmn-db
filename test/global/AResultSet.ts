import {expect, should} from "chai";
import {AConnectionPool, ADatabase, AResultSet, ATransaction, IDefaultConnectionPoolOptions} from "../../src";

export function resultSetTest(connectionPool: AConnectionPool<IDefaultConnectionPoolOptions>): void {
    describe("AResultSet", async () => {

        let globalDatabase: ADatabase;
        let globalTransaction: ATransaction;

        before(async () => {
            globalDatabase = await connectionPool.get();
            globalTransaction = await globalDatabase.createTransaction();
            await globalTransaction.start();

            await ADatabase.executeTransaction(globalDatabase, async (transaction) => {
                await transaction.execute("CREATE TABLE TEST_TABLE(id INT NOT NULL PRIMARY KEY, name VARCHAR(20))");
            });

            await ADatabase.executeTransaction(globalDatabase, async (transaction) => {
                await ATransaction.executeStatement(transaction,
                    "INSERT INTO TEST_TABLE (id, name) VALUES(:id, :name)", async (statement) => {
                        const data = getData(10);
                        for (const item of data) {
                            await statement.execute(item);
                        }
                    });
            });
        });

        after(async () => {
            await globalTransaction.execute("DROP TABLE TEST_TABLE");
            await globalTransaction.commit();
            await globalDatabase.disconnect();
        });

        it("lifecycle", async () => {
            const resultSet = await globalTransaction.executeQuery("SELECT FIRST 2 * FROM TEST_TABLE");

            expect(await resultSet.to(1)).to.equal(true);
            expect(resultSet.position).to.equal(1);
            expect(await resultSet.isClosed()).to.equal(false);

            await resultSet.close();
            expect(await resultSet.isClosed()).to.equal(true);
        });

        it("'isXXX' methods should not change the position (empty dataSet)", async () => {
            await ATransaction.executeResultSet(globalTransaction, "SELECT FIRST 0 * FROM TEST_TABLE",
                async (resultSet) => {
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);

                    expect(await resultSet.next()).to.equal(false);
                    expect(resultSet.position).to.equal(0);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);
                    expect(resultSet.position).to.equal(0);
                });
        });

        it("'isXXX' methods should not change the position (non empty dataSet)", async () => {
            await ATransaction.executeResultSet(globalTransaction, "SELECT FIRST 1 * FROM TEST_TABLE",
                async (resultSet) => {
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(true);
                    expect(await resultSet.isAfterLast()).to.equal(false);
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);

                    expect(await resultSet.next()).to.equal(true);
                    expect(resultSet.position).to.equal(0);
                    expect(await resultSet.isFirst()).to.equal(true);
                    expect(await resultSet.isLast()).to.equal(true);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);
                    expect(resultSet.position).to.equal(0);

                    expect(await resultSet.next()).to.equal(false);
                    expect(resultSet.position).to.equal(1);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(true);
                    expect(resultSet.position).to.equal(1);
                });
        });

        it("navigate (next/previous) an empty dataSet", async () => {
            await ATransaction.executeResultSet(globalTransaction, "SELECT FIRST 0 * FROM TEST_TABLE",
                async (resultSet) => {
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);

                    expect(await resultSet.next()).to.equal(false);
                    expect(resultSet.position).to.equal(0);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);

                    expect(await resultSet.previous()).to.equal(false);
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);
                });
        });

        it("navigate (to) an empty dataSet", async () => {
            await ATransaction.executeResultSet(globalTransaction, "SELECT FIRST 0 * FROM TEST_TABLE",
                async (resultSet) => {
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);

                    expect(await resultSet.to(20)).to.equal(false);
                    expect(resultSet.position).to.equal(0);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);
                });
        });

        it("navigate (first/last) an empty dataSet", async () => {
            await ATransaction.executeResultSet(globalTransaction, "SELECT FIRST 0 * FROM TEST_TABLE",
                async (resultSet) => {
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);

                    expect(await resultSet.first()).to.equal(false);
                    expect(resultSet.position).to.equal(0);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);

                    expect(await resultSet.last()).to.equal(false);
                    expect(resultSet.position).to.equal(0);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);
                });
        });

        it("navigate (beforeFirst/afterLast) an empty dataSet", async () => {
            await ATransaction.executeResultSet(globalTransaction, "SELECT FIRST 0 * FROM TEST_TABLE",
                async (resultSet) => {
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);

                    should().not.exist(await resultSet.beforeFirst());
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);

                    should().not.exist(await resultSet.afterLast());
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);
                });
        });

        it("navigate (next/previous) an non empty dataSet", async () => {
            await ATransaction.executeResultSet(globalTransaction, "SELECT FIRST 1 * FROM TEST_TABLE",
                async (resultSet) => {
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(true);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);

                    expect(await resultSet.next()).to.equal(true);
                    expect(resultSet.position).to.equal(0);
                    expect(await resultSet.isFirst()).to.equal(true);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(true);
                    expect(await resultSet.isAfterLast()).to.equal(false);

                    expect(await resultSet.next()).to.equal(false);
                    expect(resultSet.position).to.equal(1);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(true);

                    expect(await resultSet.previous()).to.equal(true);
                    expect(resultSet.position).to.equal(0);
                    expect(await resultSet.isFirst()).to.equal(true);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(true);
                    expect(await resultSet.isAfterLast()).to.equal(false);

                    expect(await resultSet.previous()).to.equal(false);
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(true);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);
                });
        });

        it("navigate (to) an non empty dataSet", async () => {
            await ATransaction.executeResultSet(globalTransaction, "SELECT FIRST 1 * FROM TEST_TABLE",
                async (resultSet) => {
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(true);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);

                    expect(await resultSet.to(1)).to.equal(false);
                    expect(resultSet.position).to.equal(1);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(true);

                    expect(await resultSet.to(AResultSet.NO_INDEX)).to.equal(false);
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(true);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);
                });
        });

        it("navigate (first/last) an non empty dataSet", async () => {
            await ATransaction.executeResultSet(globalTransaction, "SELECT FIRST 1 * FROM TEST_TABLE",
                async (resultSet) => {
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(true);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(false);

                    expect(await resultSet.first()).to.equal(true);
                    expect(resultSet.position).to.equal(0);
                    expect(await resultSet.isFirst()).to.equal(true);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(true);
                    expect(await resultSet.isAfterLast()).to.equal(false);

                    expect(await resultSet.last()).to.equal(true);
                    expect(resultSet.position).to.equal(0);
                    expect(await resultSet.isFirst()).to.equal(true);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(true);
                    expect(await resultSet.isAfterLast()).to.equal(false);

                    expect(await resultSet.next()).to.equal(false);
                    expect(resultSet.position).to.equal(1);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(true);
                });
        });

        it("navigate (beforeFirst/afterLast) an non empty dataSet", async () => {
            await ATransaction.executeResultSet(globalTransaction, "SELECT FIRST 1 * FROM TEST_TABLE",
                async (resultSet) => {
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(true);
                    expect(await resultSet.isAfterLast()).to.equal(false);

                    should().not.exist(await resultSet.beforeFirst());
                    expect(resultSet.position).to.equal(AResultSet.NO_INDEX);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(true);
                    expect(await resultSet.isAfterLast()).to.equal(false);

                    should().not.exist(await resultSet.afterLast());
                    expect(resultSet.position).to.equal(1);
                    expect(await resultSet.isFirst()).to.equal(false);
                    expect(await resultSet.isLast()).to.equal(false);
                    expect(await resultSet.isBeforeFirst()).to.equal(false);
                    expect(await resultSet.isAfterLast()).to.equal(true);
                });
        });

        it("read data", async () => {
            await ATransaction.executeResultSet(globalTransaction, "SELECT * FROM TEST_TABLE",
                async (resultSet) => {
                    const result = await resultSet.getArrays();
                    expect(result.map((array) => ({id: array[0], name: array[1]}))).to.deep.equal(getData(10));
                });
        });
    });
}

function getData(count: number): Array<{ id: number, name: string }> {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({id: i, name: `Name №${i + 1}`});
    }
    return data;
}
