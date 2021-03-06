/**
 * Converts a given value to JSON and writes it to the given key in
 * localStorage.
 */
 export const setLocalStorage = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
};

/**
 * Fetches the value from a given key from localStorage. If the stored value is
 * in JSON format, the parsed value will be returned.
 */
export const getLocalStorage = (key: string) => {
    const value = localStorage.getItem(key);

    // return undefined for not defined values
    // because "null" might be ambiguous if there is actually "null" stored for that key
    if (value == null) return undefined;

    try {
        return JSON.parse(value);
    } catch(e) {
        return value;
    }
};

export const round = (value: number, precision: number) => {
    let f = Math.pow(10, precision);
    return Math.round(value * f) / f;
}