const hasText = (value) => typeof value === "string" && value.trim().length > 0;

const toDate = (value) => {
    if (!hasText(value)) {
        return null;
    }

    const trimmedValue = value.trim();
    const date = /^\d{4}-\d{2}$/.test(trimmedValue)
        ? new Date(`${trimmedValue}-01T00:00:00`)
        : new Date(trimmedValue);

    return Number.isNaN(date.getTime()) ? null : date;
};

export const formatMonthYear = (value, fallback = "") => {
    if (!hasText(value)) {
        return fallback;
    }

    const trimmedValue = value.trim();
    if (/^(present|current)$/i.test(trimmedValue)) {
        return "Present";
    }

    if (/^\d{4}$/.test(trimmedValue)) {
        return trimmedValue;
    }

    const date = toDate(trimmedValue);
    return date
        ? date.toLocaleDateString(undefined, { month: "short", year: "numeric" })
        : trimmedValue;
};

export const formatFullDate = (value, fallback = "") => {
    const date = toDate(value);
    return date
        ? date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
        : fallback;
};