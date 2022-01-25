"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteRecords = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const config_json_1 = __importDefault(require("../config.json"));
const sql = sqlite3_1.default.verbose();
const tableName = config_json_1.default.database.tableName;
class SQLiteRecords {
    constructor(nameDB) {
        this.db = null;
        this.name = nameDB + '.sqlite';
        this.db = new sql.Database(this.name);
        // Создать базу данных если ее нет
        this.db.run(`CREATE TABLE if not exists ${tableName} (city TEXT, name TEXT, bik TEXT, coor TEXT)`);
    }
    /**
     * Закрыть базу данных.
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
    /**
     * Добавляет запись, объект в параметрах.
     * @param {string} query - запрос.
     * @param {object} param - параметр запроса.
     * @returns
     */
    async all(query, param) {
        const db = this.db;
        if (db) {
            return await new Promise(function (resolve, reject) {
                db.all(query, param, function (err, rows) {
                    if (err)
                        return reject(null);
                    resolve(rows);
                });
            });
        }
        else
            return Promise.reject(null);
    }
    /**
     * Выполняет запрос.
     * @param {string} query - запрос.
     * @param {object} param - параметры запроса.
     * @returns {object/null} - результат выполнения.
     */
    async run(query, param) {
        const db = this.db;
        if (db) {
            return await new Promise(function (resolve, reject) {
                db.run(query, param, function (err, rows) {
                    if (err)
                        return reject(null);
                    resolve(rows);
                });
            });
        }
        else
            return Promise.reject(null);
    }
    /**
     * Найти запись.
     * @param {string} template - шаблон поиска.
     * @returns {object/null} - найденые записи или ничего.
     */
    async findRecord(template) {
        if (template.length < 7)
            return [];
        const bics = await this.all(`SELECT * FROM ${tableName} where bik like $bik`, { $bik: `%${template}%` }); // Найти запись по бик
        const coors = await this.all(`SELECT * FROM ${tableName} where coor like $coor`, { $coor: `%${template}%` }); // Найти запись по коор счету
        if (bics && coors)
            return bics.concat(coors);
        else if (bics)
            return bics;
        else if (coors)
            return coors;
        else
            return ['fddf'];
    }
    /**
     * Добавить запись.
     * @param {RecordBank} recordBank - данные по банку.
     */
    async addRecord(recordBank) {
        return await this.run(`INSERT INTO ${tableName} VALUES (?,?,?,?)`, [recordBank.city, recordBank.name, recordBank.bik, recordBank.coor]);
    }
    /**
     * Удаляет все строки из таблицы.
     */
    async clearRecords() {
        await this.run(`DELETE FROM ${tableName}`, {});
    }
    /**
     * Проверяет запись не содержит правильных значений.
     * @param {RecordBank} recordBank - данные по банку.
     * @returns {Boolean} - true запись пуста.
     */
    isEmpty(recordBank) {
        return !(recordBank.name && recordBank.city && recordBank.bik && recordBank.coor);
    }
}
exports.SQLiteRecords = SQLiteRecords;
