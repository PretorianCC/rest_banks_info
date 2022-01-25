import { Router, Request, Response } from "express";
import axios from 'axios';
import unzipper from 'unzipper';
import { decodeStream } from 'iconv-lite';
import config from '../config.json'; // настройки сервера
import streamToString from '../util/streamToString'
import { RecordBank, SQLiteRecords } from '../util/SQLiteRecords';

const router = Router();

router.get(config.server.path, (req: Request, res: Response) => {
  res.send(`
    <div>Поиск банка по бик или корр счету.</div>
  `);
});

router.get(`${config.server.path}/:id`, async (req: Request, res: Response) => {
  const template = req.params.id as string;
  if (template.length) {
    const db: SQLiteRecords = req.app.get('database');
    const records = await db.findRecord(template);
    res.statusMessage = "Passed.";
    res.status(200);
    res.json(records);  
  } else {
    res.statusMessage = "Error in passed search template.";
    res.status(400).end();
  }
});

router.get(`${config.server.path}/update/:id`, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (id !== config.database.id) {
    res.statusMessage = "Classifier download error";
    res.status(417).end();
    return;
  }
  try {

    // Скачать файл и разархивировать
    const response = await axios({
      method: "get",
      url: config.banks.url,
      responseType: "stream",
    });
    
    const stream = response.data.pipe(unzipper.ParseOne()).pipe(decodeStream('win1251'));

    const result = await streamToString(stream);
    const text = result.split('\n')
    const db: SQLiteRecords = req.app.get('database');
    await db.clearRecords();
    for (let item of text) {
      const line = item.split('\t')
      const record: RecordBank = {
        city: line[1],
        name: line[3],
        bik: line[5],
        coor: line[6]
      };
      if (db.isEmpty(record)) continue;
      await db.addRecord(record);
    }
    res.statusMessage = "Classifier updated";
    res.status(200).end();
  } catch(err) {
    res.statusMessage = "Classifier download error";
    res.status(417).end();
  }
});

router.get('*', (req: Request, res: Response) => {
  res.status(404);
  res.send('Not found');
});

export {router};