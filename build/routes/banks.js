"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const unzipper_1 = __importDefault(require("unzipper"));
const iconv_lite_1 = require("iconv-lite");
const config_json_1 = __importDefault(require("../config.json")); // настройки сервера
const streamToString_1 = __importDefault(require("../util/streamToString"));
const router = (0, express_1.Router)();
exports.router = router;
router.get(config_json_1.default.server.path, (req, res) => {
    res.send(`
    <div>Поиск банка по бик или корр счету.</div>
  `);
});
router.get(`${config_json_1.default.server.path}/:id`, async (req, res) => {
    const template = req.params.id;
    if (template.length) {
        const db = req.app.get('database');
        const records = await db.findRecord(template);
        res.statusMessage = "Passed.";
        res.status(200);
        res.json(records);
    }
    else {
        res.statusMessage = "Error in passed search template.";
        res.status(400).end();
    }
});
router.get(`${config_json_1.default.server.path}/update/:id`, async (req, res) => {
    const id = req.params.id;
    if (id !== config_json_1.default.database.id) {
        res.statusMessage = "Classifier download error";
        res.status(417).end();
        return;
    }
    try {
        // Скачать файл и разархивировать
        const response = await (0, axios_1.default)({
            method: "get",
            url: config_json_1.default.banks.url,
            responseType: "stream",
        });
        const stream = response.data.pipe(unzipper_1.default.ParseOne()).pipe((0, iconv_lite_1.decodeStream)('win1251'));
        const result = await (0, streamToString_1.default)(stream);
        const text = result.split('\n');
        const db = req.app.get('database');
        await db.clearRecords();
        for (let item of text) {
            const line = item.split('\t');
            const record = {
                city: line[1],
                name: line[3],
                bik: line[5],
                coor: line[6]
            };
            if (db.isEmpty(record))
                continue;
            await db.addRecord(record);
        }
        res.statusMessage = "Classifier updated";
        res.status(200).end();
    }
    catch (err) {
        res.statusMessage = "Classifier download error";
        res.status(417).end();
    }
});
router.get('*', (req, res) => {
    res.status(404);
    res.send('Not found');
});
