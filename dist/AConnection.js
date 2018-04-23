"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ATransaction_1 = require("./ATransaction");
/**
 * Example:
 * <pre>
 * (async () => {
 *      const parent = Factory.XXModule.newConnection();
 *      try {
 *          await parent.connect({...});
 *
 *          const parent = await parent.createTransaction();
 *          try {
 *              await parent.start();
 *
 *              const resultSet = await parent.executeQuery("some sql");
 *              await resultSet.getArrays();
 *              await resultSet.close();
 *
 *              await parent.commit();
 *          } catch (error) {
 *              try {
 *                  await parent.rollback();
 *              } catch (error) {
 *                  console.warn(error);
 *              }
 *              throw error;
 *          }
 *      } finally {
 *          try {
 *              await parent.disconnect();
 *          } catch (err) {
 *              console.warn(err);
 *          }
 *      }
 * })()
 * </pre>
 */
class AConnection {
    static async executeSelf(selfReceiver, callback) {
        let self;
        try {
            self = await selfReceiver(null);
            return await callback(self);
        }
        finally {
            if (self) {
                await self.disconnect();
            }
        }
    }
    /**
     * Example:
     * <pre>
     * const result = await AConnection.executeConnection(Factory.XXModule.newConnection()), {}, async (source) => {
     *      return await AConnection.executeTransaction(parent, {}, async (parent) => {
     *          return ...
     *      });
     * })}
     * </pre>
     */
    static async executeConnection(connection, options, callback) {
        return await AConnection.executeSelf(async () => {
            await connection.connect(options);
            return connection;
        }, callback);
    }
    static async executeTransaction(connection, options, callback) {
        if (!callback) {
            callback = options;
        }
        return await ATransaction_1.ATransaction.executeSelf(async () => {
            const transaction = await connection.createTransaction(options);
            await transaction.start();
            return transaction;
        }, callback);
    }
}
exports.AConnection = AConnection;
//# sourceMappingURL=AConnection.js.map