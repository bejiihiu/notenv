import { debug } from "./utils/debug.js";

/**
 * Builder — обёртка вокруг результата parse(...)
 * даёт удобный доступ через get(path)
 */
class Builder {
    constructor(obj = {}) {
        this._data = obj;
        debug.trace("Builder initialized:", obj);
    }

    get(pathStr, defaultValue = undefined) {
        debug.trace(`Builder.get("${pathStr}") called`);
        if (!pathStr) {
            debug.debug("Empty path → returning defaultValue:", defaultValue);
            return defaultValue;
        }

        const parts = pathStr.split(".");
        let cur = this._data;
        for (const p of parts) {
            if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
                cur = cur[p];
            } else {
                debug.debug(
                    `Builder.get: path "${pathStr}" not found → returning defaultValue:`,
                    defaultValue
                );
                return defaultValue;
            }
        }

        debug.debug(`Builder.get("${pathStr}") →`, cur);
        return cur;
    }

    set(pathStr, value) {
        debug.trace(`Builder.set("${pathStr}",`, value, ") called");
        const parts = pathStr.split(".");
        let cur = this._data;

        for (let i = 0; i < parts.length - 1; i++) {
            const p = parts[i];
            if (!cur[p] || typeof cur[p] !== "object") {
                debug.debug(`Builder.set: creating nested object for "${p}"`);
                cur[p] = {};
            }
            cur = cur[p];
        }

        cur[parts[parts.length - 1]] = value;
        debug.debug(`Builder.set: path "${pathStr}" set to`, value);
        return this;
    }

    has(pathStr) {
        const exists = this.get(pathStr, undefined) !== undefined;
        debug.debug(`Builder.has("${pathStr}") →`, exists);
        return exists;
    }

    toJSON() {
        debug.trace("Builder.toJSON() called");
        return JSON.parse(JSON.stringify(this._data));
    }
}

export { Builder };
