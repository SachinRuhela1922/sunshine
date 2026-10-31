// Shared DOB helper - DOB hamesha DD/MM/YYYY me dikhega.
// Sirf saal likha ho (e.g. "2008") to wahi "2008" dikhega.
const pad = n => String(n).padStart(2, "0");

function formatDOB(value) {
    if (value === null || value === undefined) return "";

    // Old records jo real Date ki tarah save hue the
    if (value instanceof Date) {
        if (isNaN(value.getTime())) return "";
        return `${pad(value.getUTCDate())}/${pad(value.getUTCMonth() + 1)}/${value.getUTCFullYear()}`;
    }

    const text = String(value).trim();
    if (!text) return "";

    // 2006-08-20 ya 2006-08-20T00:00:00.000Z  ->  20/08/2006
    const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/);
    if (iso) return `${pad(iso[3])}/${pad(iso[2])}/${iso[1]}`;

    // 21-05-2008, 21.5.2008, 21/05/2008  ->  21/05/2008
    const dmy = text.match(/^(\d{1,2})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{4})$/);
    if (dmy) return `${pad(dmy[1])}/${pad(dmy[2])}/${dmy[3]}`;

    // Sirf saal ("2008") ya koi aur text - jaisa save hai waisa hi
    return text;
}

module.exports = { formatDOB };