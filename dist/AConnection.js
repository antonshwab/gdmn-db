"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ATransaction_1 = require("./ATransaction");
/**
 * Example:
 * <pre>
 * (async () => {
 *      const connection = Factory.XXModule.newConnection();
 *      try {
 *          await connection.connect({...});
 *
 *          const transaction = await connection.createTransaction();
 *          try {
 *              await transaction.start();
 *
 *              const resultSet = await transaction.executeQuery("some sql");
 *              await resultSet.getArrays();
 *              await resultSet.close();
 *
 *              await transaction.commit();
 *          } catch (error) {
 *              try {
 *                  await transaction.rollback();
 *              } catch (error) {
 *                  console.warn(error);
 *              }
 *              throw error;
 *          }
 *      } finally {
 *          try {
 *              await connection.disconnect();
 *          } catch (err) {
 *              console.warn(err);
 *          }
 *      }
 * })()
 * </pre>
 */
class AConnection {
    static async executeFromParent(sourceCallback, resultCallback) {
        let connection;
        try {
            connection = await sourceCallback(null);
            return await resultCallback(connection);
        }
        finally {
            if (connection) {
                await connection.disconnect();
            }
        }
    }
    /**
     * Example:
     * <pre>
     * const result = await AConnection.executeConnection(Factory.XXModule.newConnection()), {}, async (source) => {
     *      return await AConnection.executeTransaction(transaction, {}, async (transaction) => {
     *          return ...
     *      });
     * })}
     * </pre>
     */
    static async executeConnection(connection, options, callback) {
        return await AConnection.executeFromParent(async () => {
            await connection.connect(options);
            return connection;
        }, callback);
    }
    static async executeTransaction(connection, options, callback) {
        if (!callback) {
            callback = options;
        }
        return await ATransaction_1.ATransaction.executeFromParent(async () => {
            const transaction = await connection.createTransaction(options);
            await transaction.start();
            return transaction;
        }, callback);
    }
}
exports.AConnection = AConnection;
//# sourceMappingURL=AConnection.js.map