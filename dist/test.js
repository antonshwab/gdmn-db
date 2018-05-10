"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
index_1.AConnection.executeConnection({
    connection: index_1.Factory.FBDriver.newConnection(),
    options: {
        host: "brutto",
        port: 3053,
        username: "SYSDBA",
        password: "masterkey",
        path: "k:\\bases\\broiler\\GDBASE_2017_10_02.FDB"
    },
    callback: (connection) => index_1.AConnection.executeTransaction({
        connection,
        callback: async (transaction) => {
            const resultSet = await connection.executeQuery(transaction, "SELECT FIRST 1 * FROM GD_USER");
            for (let i = 0; await resultSet.next(); i++) {
                console.log(await resultSet.getAny(0));
            }
            await resultSet.close();
        }
    })
})
    .then(() => console.log("done"))
    .catch(console.warn);
//# sourceMappingURL=test.js.map