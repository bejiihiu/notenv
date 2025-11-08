import { debug } from "../debug.js";

/**
 * Примитивный поиск ключа по всем секциям — возвращаем первый найденный.
 */
function findKeyInSections(configSections, key) {
    debug.trace("findKeyInSections() looking for key:", key);

    for (const sectionName of Object.keys(configSections)) {
        const section = configSections[sectionName];
        debug.trace(`Checking section "${sectionName}"`);

        if (Object.prototype.hasOwnProperty.call(section, key)) {
            const value = section[key];
            debug.debug(
                `Found key "${key}" in section "${sectionName}" →`,
                value
            );
            return { sectionName, value };
        }
    }

    debug.warn(`Key "${key}" not found in any section`);
    return null;
}

export { findKeyInSections };
