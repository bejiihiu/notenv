import { parseConfig } from "../src/parser/parser.js";

const text = `
# общие настройки приложения
[general]
APP_NAME = xs
VERSION = 1.0.0
DEBUG = true
ALLOWED_HOSTS = localhost,example.com,test.com

# настройки базы данных
[database]
DB.HOST = 127.0.0.1
DB.PORT = 5432
DB.USER = root
DB.PASSWORD = supersecret
`;

console.log(parseConfig(text));