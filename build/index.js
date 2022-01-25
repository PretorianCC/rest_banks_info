"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_json_1 = __importDefault(require("./config.json")); // настройки сервера
const SQLiteRecords_1 = require("./util/SQLiteRecords");
const express_1 = __importDefault(require("express"));
const banks_1 = require("./routes/banks");
const app = (0, express_1.default)();
app.set('database', new SQLiteRecords_1.SQLiteRecords(config_json_1.default.database.tableName));
app.use(banks_1.router);
app.listen(config_json_1.default.server.port, () => {
    console.log(`Сервер запущен: ${config_json_1.default.server.host}:${config_json_1.default.server.port}`);
});
