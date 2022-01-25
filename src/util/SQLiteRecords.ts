import sqlite from 'sqlite3';
import config from '../config.json';

const sql = sqlite.verbose();

type SqlDatabase = sqlite.Database | null;

export interface RecordBank {
  city: string;
  name: string;
  bik: string;
  coor: string;
}

const tableName: string = config.database.tableName;

export class SQLiteRecords {
  private readonly name;
  private db: SqlDatabase = null;
  constructor(nameDB: string) {
    this.name = nameDB + '.sqlite';
    this.db = new sql.Database(this.name);
    // Создать базу данных если ее нет
    this.db.run(`CREATE TABLE if not exists ${tableName} (city TEXT, name TEXT, bik TEXT, coor TEXT)`);
  }

  /**
   * Закрыть базу данных.
   */
  close(): void {
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
  private async all(query: string, param: object): Promise<any[] | null> {
    const db = this.db
    if (db) {
      return await new Promise(function(resolve,reject) {
        db.all(query, param, function(err: Error | null, rows: any[]) {
          if(err) return reject(null);
          resolve(rows);
        })
      })
    } else return Promise.reject(null)
  }
  
  /**
   * Выполняет запрос.
   * @param {string} query - запрос.
   * @param {object} param - параметры запроса.
   * @returns {object/null} - результат выполнения.
   */
  private async run(query: string, param: object): Promise<any[] | null> {
    const db = this.db
    if (db) {
      return await new Promise(function(resolve, reject) {
        db.run(query, param, function(err : Error | null, rows: any[]) {
          if(err) return reject(null);
          resolve(rows);
        })
      })
    } else return Promise.reject(null)
  }

  /**
   * Найти запись.
   * @param {string} template - шаблон поиска.
   * @returns {object/null} - найденые записи или ничего.
   */
  async findRecord(template: string): Promise<any[]> {
    if (template.length < 7) return [];
    const bics = await this.all(`SELECT * FROM ${tableName} where bik like $bik`, {$bik: `%${template}%`}); // Найти запись по бик
    const coors = await this.all(`SELECT * FROM ${tableName} where coor like $coor`, {$coor: `%${template}%`}); // Найти запись по коор счету
    if (bics && coors) return bics.concat(coors);
    else if (bics) return bics;
    else if (coors) return coors;
    else return ['fddf'];
  }

  /**
   * Добавить запись.
   * @param {RecordBank} recordBank - данные по банку.
   */
  async addRecord(recordBank: RecordBank): Promise<any[] | null> {
    return await this.run(`INSERT INTO ${tableName} VALUES (?,?,?,?)`, [recordBank.city, recordBank.name, recordBank.bik, recordBank.coor]);
  }

  /**
   * Удаляет все строки из таблицы.
   */
  async clearRecords(): Promise<void> {
    await this.run(`DELETE FROM ${tableName}`, {});
  }

  /**
   * Проверяет запись не содержит правильных значений.
   * @param {RecordBank} recordBank - данные по банку.
   * @returns {Boolean} - true запись пуста.
   */
  isEmpty(recordBank: RecordBank): Boolean {
    return !(recordBank.name && recordBank.city && recordBank.bik && recordBank.coor);
  }
}
