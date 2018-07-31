import {AConnection, Factory} from "../../src";
import {IConnectionOptions} from "../../src/AConnection";

export interface IDataItem {
    id: number;
    name: string;
    dateTime: Date;
    onlyDate: Date;
    onlyTime: Date;
    nullValue: null;
    textBlob: string;
}

export function getData(count: number): IDataItem[] {
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

export async function populateDb(dbOptions: IConnectionOptions, recordsCount: number): Promise<IDataItem[]> {
    const arrayData = getData(recordsCount);

    const driver = Factory.FBDriver;
    const connection = driver.newConnection();

    await connection.createDatabase(dbOptions);
    try {
        await AConnection.executeTransaction({
            connection,
            callback: async (transaction) => {
                await connection.execute(transaction, `
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
            connection,
            callback: (transaction) => AConnection.executePrepareStatement({
                connection,
                transaction,
                sql: `
                    INSERT INTO TEST_TABLE (id, name, dateTime, onlyDate, onlyTime, nullValue, textBlob)
                    VALUES(:id, :name, :dateTime, :onlyDate, :onlyTime, :nullValue, :textBlob)
                    RETURNING id, name, dateTime, onlyDate, onlyTime, nullValue, textBlob
                `,
                callback: async (statement) => {
                    for (const dataItem of arrayData) {
                        const result = await statement.executeReturning(dataItem);
                        expect(await result.getAny("ID")).toEqual(dataItem.id);
                        expect(await result.getAny("NAME")).toEqual(dataItem.name);
                        expect((await result.getAny("DATETIME"))!.getTime())
                            .toEqual(dataItem.dateTime.getTime());
                        expect((await result.getAny("ONLYDATE"))!.getTime())
                            .toEqual(dataItem.onlyDate.getTime());
                        expect((await result.getAny("ONLYTIME"))!.getTime())
                            .toEqual(dataItem.onlyTime.getTime());
                        expect(await result.getAny("NULLVALUE")).toBeNull();
                        expect(await result.getAny("TEXTBLOB")).toEqual(dataItem.textBlob);
                    }
                }
            })
        });
    } finally {
        await connection.disconnect();
    }
    return arrayData;
}
