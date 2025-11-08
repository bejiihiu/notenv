// utils/debug.js

const LEVELS = ["ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

/**
 * Debug logger with levels
 * Usage:
 *   debug.setLevel("DEBUG");   // enable debug
 *   debug.info("Message");
 *   debug.trace("Detailed log");
 */
class Debugger {
    constructor() {
        this.level = "ERROR"; // default: show only errors
    }

    setLevel(level) {
        if (!LEVELS.includes(level)) {
            throw new Error(
                `Invalid debug level: ${level}. Valid: ${LEVELS.join(", ")}`
            );
        }
        this.level = level;
    }

    #shouldLog(level) {
        return LEVELS.indexOf(level) <= LEVELS.indexOf(this.level);
    }

    error(...msg) {
        if (this.#shouldLog("ERROR")) console.error("[ERROR]", ...msg);
    }
    warn(...msg) {
        if (this.#shouldLog("WARN")) console.warn("[WARN]", ...msg);
    }
    info(...msg) {
        if (this.#shouldLog("INFO")) console.log("[INFO]", ...msg);
    }
    debug(...msg) {
        if (this.#shouldLog("DEBUG")) console.log("[DEBUG]", ...msg);
    }
    trace(...msg) {
        if (this.#shouldLog("TRACE")) console.log("[TRACE]", ...msg);
    }
}

export const debug = new Debugger();
