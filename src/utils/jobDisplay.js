export const getRelativeAge = (date) => {
    const postedAt = new Date(date).getTime();
    if (!date || Number.isNaN(postedAt)) return "recently";

    const days = Math.max(0, Math.floor((Date.now() - postedAt) / 86400000));
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 30) return `${days} days ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? "" : "s"} ago`;
};

export const getJobStatusClasses = (status) => ({
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Draft: "bg-amber-50 text-amber-700 ring-amber-200",
    Closed: "bg-slate-100 text-slate-600 ring-slate-200",
    Deleted: "bg-rose-50 text-rose-700 ring-rose-200",
}[status] || "bg-emerald-50 text-emerald-700 ring-emerald-200");
