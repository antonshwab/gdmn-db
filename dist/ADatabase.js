"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ATransaction_1 = require("./ATransaction");
/**
 * Example:
 * <pre>
 * (async () => {
 *      const database = Factory.XXModule.newDatabase();
 *      try {
 *          await database.connect({...});
 *
 *          const transaction = await database.createTransaction();
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
 *              await database.disconnect();
 *          } catch (err) {
 *              console.warn(err);
 *          }
 *      }
 * })()
 * </pre>
 */
class ADatabase {
    static async executeFromParent(sourceCallback, resultCallback) {
        let database;
        try {
            database = await sourceCallback(null);
            return await resultCallback(database);
        }
        finally {
            if (database) {
                await database.disconnect();
            }
        }
    }
    /**
     * Example:
     * <pre>
     * const result = await ADatabase.executeConnection(Factory.XXModule.newDatabase()), {}, async (source) => {
     *      return await ADatabase.executeTransaction(transaction, {}, async (transaction) => {
     *          return ...
     *      });
     * })}
     * </pre>
     */
    static async executeConnection(database, options, callback) {
        return await ADatabase.executeFromParent(async () => {
            await database.connect(options);
            return database;
        }, callback);
    }
    /**
     * Example:
     * <pre>
     * const result = await ADatabase.executeTransaction(database, {}, async transaction => {
     *      return await transaction.executeStatement("some sql", async statement => {
     *          return ...
     *      });
     * })}
     * </pre>
     */
    static async executeTransaction(database, options, callback) {
        return await ATransaction_1.ATransaction.executeFromParent(async () => {
            const transaction = await database.createTransaction(options || undefined);
            await transaction.start();
            return transaction;
        }, callback);
    }
}
exports.ADatabase = ADatabase;
//# sourceMappingURL=ADatabase.js.map