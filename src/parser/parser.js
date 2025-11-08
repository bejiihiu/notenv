function parseValue(value) {
    value = value.trim();

    // boolean
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;

    // number (int or float)
    if (!Number.isNaN(Number(value)) && value !== "") return Number(value);

    // array: a,b,c
    if (value.includes(",")) {
        return value.split(",").map((v) => v.trim());
    }

    return value;
}

function setNested(obj, keys, value) {
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
}

function parseConfig(text) {
    const config = {};
    let currentSection = null;

    for (let line of text.split("\n").map((l) => l.trim())) {
        // пропуск пустых и комментариев
        if (!line || line.startsWith("#")) continue;

        // секция
        if (line.startsWith("[") && line.endsWith("]")) {
            currentSection = line.slice(1, -1).trim();
            config[currentSection] = {};
            continue;
        }

        // ключ = значение
        if (line.includes("=") && currentSection) {
            const [key, value] = line.split("=");

            const keyParts = key.trim().split(".");
            setNested(config[currentSection], keyParts, parseValue(value));
        }
    }

    return config;
}

export { parseConfig };
