## rest сервис: Поиск банка по бик или корр счету.

Возвращает по запросу информацию о банках, например:
```json
[
  {
    "city": "ЧЕЛЯБИНСК",
    "name": "АО \"УРАЛПРОМБАНК\"",
    "bik": "047501906",
    "coor": "30101810600000000906"
  }
]
```

Минимальный поиск 7 символов.

Конфигурация в config.json:
```Json
{
  "server": {
    "host": "localhost",
    "port": 3001,
    "path": "/banks"
  },
  "database": {
    "tableName": "info_banks",
    "id": "12345"
  },
  "banks": {
    "url": "https://cbrates.rbc.ru/bnk/bnk.zip"
  }
}
```

tableName - имя таблицы sqlite.
id - идентификатор для обновления сервиса новыми данными.