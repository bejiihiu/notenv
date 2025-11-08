import { parseConfig } from "./parserValues.js";
import { findKeyInSections } from "../utils/findKeyInSections.js";
import { debug } from "../utils/debug.js";
import fs from "node:fs";
import path from "node:path";

function parse(arg, schema = undefined) {
    debug.trace("parse() called with:", arg);

    let text = String(arg);

    try {
        const maybePath = path.resolve(process.cwd(), arg);
        debug.trace("Resolved path:", maybePath);

        if (fs.existsSync(maybePath) && fs.statSync(maybePath).isFile()) {
            debug.info("Loading config file:", maybePath);
            text = fs.readFileSync(maybePath, "utf8");
        } else {
            debug.debug("Arg is NOT a file. Treating as text input.");
        }
    } catch (e) {
        debug.error("Error reading file:", e);
    }
    const sections = parseConfig(text);
    debug.debug("Parsed sections:", sections);

    if (!schema) {
        debug.info("No schema provided → returning all sections.");
        return sections;
    }

    const result = {};
    debug.trace("Applying schema:", schema);

    for (const key of Object.keys(schema)) {
        const def = schema[key];
        debug.trace(`Processing schema key: "${key}"`, def);

        if (def && typeof def === "object" && !Array.isArray(def)) {
            debug.debug(`Schema key "${key}" treated as section`);

            const sectionName = key;
            const sectionData = sections[sectionName] || {};
            result[sectionName] = result[sectionName] || {};

            for (const subKey of Object.keys(def)) {
                const subDef = def[subKey];
                const raw = sectionData[subKey];

                debug.trace(
                    ` → Section "${sectionName}" key "${subKey}" raw:`,
                    raw
                );

                if (raw === undefined) {
                    debug.error(
                        `Missing key '${subKey}' in section '${sectionName}'`
                    );
                    throw new Error(
                        `Missing key '${subKey}' in section '${sectionName}'`
                    );
                } else {
                    result[sectionName][subKey] = applyType(raw, subDef);
                    debug.debug(
                        ` ✓ Applied type to ${sectionName}.${subKey}:`,
                        result[sectionName][subKey]
                    );
                }
            }
        } else {
            debug.debug(`Schema key "${key}" treated as top-level find`);

            const found = findKeyInSections(sections, key);
            if (found) {
                debug.trace(
                    `Found top-level "${key}" in section "${found.section}"`
                );
                result[key] = applyType(found.value, def);
                debug.debug(` ✓ Applied type to ${key}:`, result[key]);
            } else {
                debug.warn(`Key "${key}" not found in any section`);
                result[key] = undefined;
            }
        }
    }

    debug.info("Final parsed config:", result);
    return result;
}

export { parse };
