import config from './config.json'; // настройки сервера
import { SQLiteRecords} from './util/SQLiteRecords';

import express, {Request} from 'express';
import { router } from './routes/banks';

const app = express();
app.set('database',  new SQLiteRecords(config.database.tableName));
app.use(router);

app.listen(config.server.port, () => {
   console.log(`Сервер запущен: ${config.server.host}:${config.server.port}`);
});