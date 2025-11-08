import { parse, Builder, Types, debug } from "../index.js";

debug.setLevel("TRACE");

const env = new Builder(
    parse("C:\\Users\\bejii\\OneDrive\\Desktop\\Новая папка\\test\\env.xs", {
        // ключи вне секций ищутся по всем секциям
        debug: Types.BOOLEAN,
        hosts: Types.ARRAY,

        // если ключ — объект — это имя секции
        database: {
            host: Types.STRING,
            port: Types.INT,
        },
    })
);

console.log(env.get("database.host")); // → "127.0.0.1"
console.log(env.get("database.port")); // → 5432
console.log(env.get("hosts")); // → ["localhost", "example.com", "test.com"]
console.log(env.get("debug")); // → true
