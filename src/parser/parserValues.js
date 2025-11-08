import { debug } from "../utils/debug.js";

/**
 * Простейший INI-подобный парсер с поддержкой секций [section] и ключей с точечным путём.
 */

function parseValue(value) {
    debug.trace("parseValue() raw:", value);

    if (typeof value !== "string") {
        debug.debug("parseValue: non-string, returning:", value);
        return value;
    }

    value = value.trim();

    // boolean
    if (value.toLowerCase() === "true") {
        debug.debug("parseValue → boolean:true");
        return true;
    }
    if (value.toLowerCase() === "false") {
        debug.debug("parseValue → boolean:false");
        return false;
    }

    // number (int or float)
    if (!Number.isNaN(Number(value)) && value !== "") {
        const num = Number(value);
        debug.debug("parseValue → number:", num);
        return num;
    }

    // array: a,b,c
    if (value.includes(",")) {
        const arr = value.split(",").map((v) => v.trim());
        debug.debug("parseValue → array:", arr);
        return arr;
    }

    debug.trace("parseValue → string:", value);
    return value;
}

function setNested(obj, keys, value) {
    debug.trace(`setNested() keys=${keys.join(".")}`, "value:", value);

    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) {
            debug.debug(`Creating nested key '${key}'`);
            current[key] = {};
        }
        current = current[key];
    }
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;

    debug.debug(`Nested set: ${keys.join(".")} =`, value);
}

/**
 * Возвращает объект вида { sectionName: { key: value, ... }, ... }
 */
function parseConfig(text) {
    debug.info("parseConfig() start");
    const config = {};
    let currentSection = null;

    const lines = text.split("\n").map((l) => l.trim());
    debug.trace("Total lines:", lines.length);

    for (let line of lines) {
        debug.trace("Line:", line);

        // пропуск пустых и комментариев
        if (!line || line.startsWith("#") || line.startsWith(";")) {
            debug.trace("Skip empty/comment");
            continue;
        }

        // секция
        if (line.startsWith("[") && line.endsWith("]")) {
            currentSection = line.slice(1, -1).trim();
            debug.debug("New section:", currentSection);

            if (!config[currentSection]) config[currentSection] = {};
            continue;
        }

        // ключ = значение
        if (line.includes("=")) {
            if (!currentSection) {
                debug.warn("Key found outside a section → skipped:", line);
                continue;
            }

            const idx = line.indexOf("=");
            const key = line.slice(0, idx).trim();
            const value = line.slice(idx + 1).trim();

            debug.trace(`Key/value: ${key} = ${value}`);

            const keyParts = key.split(".");
            const parsed = parseValue(value);

            setNested(config[currentSection], keyParts, parsed);
        } else {
            debug.warn("Invalid line (no '=') → skipped:", line);
        }
    }

    debug.info("parseConfig() result:", config);
    return config;
}

/**
 * Приведение/проверка значения в соответствии со схемой типов
 * typeDef — одно из значений Types.*
 */
function applyType(value, typeDef) {
    debug.trace("applyType:", { value, typeDef });

    if (typeDef === undefined || typeDef === null) {
        debug.trace("applyType: no typeDef → returning raw");
        return value;
    }

    const t = String(typeDef).toLowerCase();
    debug.trace("applyType type:", t);

    if (t === "boolean") {
        if (typeof value === "boolean") return value;

        if (typeof value === "string") {
            const v = value.toLowerCase();
            if (v === "true") return true;
            if (v === "false") return false;
        }
        const res = Boolean(value);
        debug.debug("applyType → boolean:", res);
        return res;
    }

    if (t === "array") {
        let arr;
        if (Array.isArray(value)) arr = value;
        else if (typeof value === "string")
            arr = value.split(",").map((v) => v.trim());
        else arr = [value];

        debug.debug("applyType → array:", arr);
        return arr;
    }

    if (t === "object") {
        if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
        ) {
            debug.debug("applyType → object:", value);
            return value;
        }
        debug.warn("applyType: cannot convert to object, returning raw");
        return value;
    }

    if (t === "string") {
        const res =
            value === null || value === undefined ? value : String(value);
        debug.debug("applyType → string:", res);
        return res;
    }

    if (t === "number") {
        const n = Number(value);
        const res = Number.isNaN(n) ? value : n;
        debug.debug("applyType → number:", res);
        return res;
    }

    debug.warn("applyType: unknown typeDef, returning raw");
    return value;
}

export { parseConfig, parseValue, applyType };
