import { formatMonthYear } from "./dateFormatting";

const hasText = (value) => typeof value === "string" && value.trim().length > 0;
const asList = (value) => (Array.isArray(value) ? value : []);

const PAGE_MARGIN = 48;
const COLORS = {
    heading: [30, 41, 59],
    text: [51, 65, 85],
    muted: [100, 116, 139],
    accent: [67, 56, 202],
    rule: [226, 232, 240],
};

const loadImageAsDataUrl = async (url) => {
    if (!url) return null;
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        try {
            const image = await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = objectUrl;
            });
            // Re-encode through a canvas so any browser-supported format (webp, gif) becomes a JPEG jsPDF can embed,
            // center-cropped to a square to match the circular avatar used in the UI.
            const size = Math.min(image.naturalWidth, image.naturalHeight);
            const canvas = document.createElement("canvas");
            canvas.width = 240;
            canvas.height = 240;
            const context = canvas.getContext("2d");
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(
                image,
                (image.naturalWidth - size) / 2,
                (image.naturalHeight - size) / 2,
                size,
                size,
                0,
                0,
                canvas.width,
                canvas.height,
            );
            return canvas.toDataURL("image/jpeg", 0.9);
        } finally {
            URL.revokeObjectURL(objectUrl);
        }
    } catch {
        // Signed R2 URLs may be blocked by CORS or expired; the PDF is still useful without the photo.
        return null;
    }
};

const dateRange = (start, end, isCurrent) => {
    if (!hasText(start) && !hasText(end) && !isCurrent) return "";
    const from = formatMonthYear(start, "");
    const to = isCurrent ? "Present" : formatMonthYear(end, "Present");
    return from ? `${from} - ${to}` : to;
};

const buildFileName = (profile) => {
    const base = hasText(profile?.name)
        ? profile.name.trim().replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "")
        : "profile";
    return `${base || "profile"}_Profile.pdf`;
};

export const downloadProfilePdf = async (profile, { profileImageUrl } = {}) => {
    const [{ jsPDF }, imageData] = await Promise.all([
        import("jspdf"),
        loadImageAsDataUrl(profileImageUrl),
    ]);

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - PAGE_MARGIN * 2;
    let y = PAGE_MARGIN;

    const ensureSpace = (height) => {
        if (y + height > pageHeight - PAGE_MARGIN) {
            doc.addPage();
            y = PAGE_MARGIN;
        }
    };

    const writeText = (text, { size = 10, style = "normal", color = COLORS.text, indent = 0, gap = 4 } = {}) => {
        if (!hasText(text)) return;
        doc.setFont("helvetica", style);
        doc.setFontSize(size);
        doc.setTextColor(...color);
        const lineHeight = size * 1.35;
        const lines = doc.splitTextToSize(text.trim(), contentWidth - indent);
        lines.forEach((line) => {
            ensureSpace(lineHeight);
            doc.text(line, PAGE_MARGIN + indent, y + size);
            y += lineHeight;
        });
        y += gap;
    };

    // Title on the left, right-aligned meta (dates, status) on the same line.
    const writeEntryHeader = (title, meta) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        const metaWidth = hasText(meta) ? doc.getTextWidth(meta) + 12 : 0;
        const titleLines = doc.splitTextToSize(title, contentWidth - metaWidth);
        const lineHeight = 11 * 1.35;
        ensureSpace(lineHeight * titleLines.length);
        if (hasText(meta)) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(...COLORS.muted);
            doc.text(meta, pageWidth - PAGE_MARGIN, y + 11, { align: "right" });
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.heading);
        titleLines.forEach((line) => {
            doc.text(line, PAGE_MARGIN, y + 11);
            y += lineHeight;
        });
        y += 1;
    };

    const writeSectionHeading = (label) => {
        ensureSpace(40);
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...COLORS.accent);
        doc.text(label.toUpperCase(), PAGE_MARGIN, y + 12);
        y += 18;
        doc.setDrawColor(...COLORS.rule);
        doc.setLineWidth(1);
        doc.line(PAGE_MARGIN, y, pageWidth - PAGE_MARGIN, y);
        y += 10;
    };

    const writeLink = (url) => {
        if (!hasText(url)) return;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.accent);
        const [line] = doc.splitTextToSize(url.trim(), contentWidth);
        ensureSpace(13);
        doc.textWithLink(line, PAGE_MARGIN, y + 9, { url: url.trim() });
        y += 15;
    };

    // Header
    const photoSize = 72;
    const textLeft = imageData ? PAGE_MARGIN + photoSize + 18 : PAGE_MARGIN;
    if (imageData) {
        doc.addImage(imageData, "JPEG", PAGE_MARGIN, y, photoSize, photoSize);
    }
    let headerY = y + 24;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.heading);
    doc.text(hasText(profile?.name) ? profile.name.trim() : "Name not added", textLeft, headerY);
    headerY += 18;
    if (hasText(profile?.title)) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(...COLORS.text);
        doc.text(profile.title.trim(), textLeft, headerY);
        headerY += 16;
    }
    const contact = [profile?.email, profile?.phone, profile?.location].filter(hasText).map((value) => value.trim());
    if (contact.length) {
        doc.setFontSize(9.5);
        doc.setTextColor(...COLORS.muted);
        doc.splitTextToSize(contact.join("  |  "), pageWidth - PAGE_MARGIN - textLeft).forEach((line) => {
            doc.text(line, textLeft, headerY);
            headerY += 13;
        });
    }
    y = Math.max(headerY, imageData ? y + photoSize : 0) + 8;

    if (hasText(profile?.summary)) {
        writeSectionHeading("About");
        writeText(profile.summary);
    }

    const skills = asList(profile?.skills).filter(hasText);
    if (skills.length) {
        writeSectionHeading("Skills");
        writeText(skills.join("  •  "));
    }

    const experience = asList(profile?.experience);
    if (experience.length) {
        writeSectionHeading("Experience");
        experience.forEach((entry) => {
            writeEntryHeader(entry?.title || "Role not added", dateRange(entry?.start, entry?.end, entry?.current));
            writeText(entry?.institution, { color: COLORS.muted, gap: 2 });
            writeText(entry?.description);
            y += 4;
        });
    }

    const education = asList(profile?.education);
    if (education.length) {
        writeSectionHeading("Education");
        education.forEach((entry) => {
            writeEntryHeader(entry?.degree || "Degree not added", formatMonthYear(entry?.year, ""));
            writeText(entry?.institution, { color: COLORS.muted });
            y += 4;
        });
    }

    const publications = asList(profile?.publications);
    if (publications.length) {
        writeSectionHeading("Publications");
        publications.forEach((entry) => {
            writeEntryHeader(entry?.title || "Untitled publication", "");
            writeText(entry?.description);
            writeLink(entry?.link);
            y += 4;
        });
    }

    const projects = asList(profile?.projects);
    if (projects.length) {
        writeSectionHeading("Projects");
        projects.forEach((entry) => {
            writeEntryHeader(entry?.title || "Project not added", dateRange(entry?.start, entry?.end));
            writeText(entry?.description);
            writeLink(entry?.link);
            y += 4;
        });
    }

    const patents = asList(profile?.patents);
    if (patents.length) {
        writeSectionHeading("Patents");
        patents.forEach((entry) => {
            writeEntryHeader(entry?.title || "Patent not added", entry?.status || "");
            writeText(entry?.patentNumber, { color: COLORS.muted, gap: 2 });
            writeText(entry?.description);
            writeLink(entry?.link);
            y += 4;
        });
    }

    [
        ["certifications", "Certifications & Courses"],
        ["awards", "Awards & Honors"],
    ].forEach(([key, label]) => {
        const entries = asList(profile?.[key]);
        if (!entries.length) return;
        writeSectionHeading(label);
        entries.forEach((entry) => {
            writeEntryHeader(entry?.title || "Not added", formatMonthYear(entry?.year, ""));
            writeText(entry?.issuer, { color: COLORS.muted, gap: 2 });
            writeLink(entry?.link);
            y += 4;
        });
    });

    const languages = asList(profile?.languages).filter((entry) => hasText(entry?.name));
    if (languages.length) {
        writeSectionHeading("Languages");
        writeText(
            languages
                .map((entry) => (hasText(entry.proficiency) ? `${entry.name.trim()} (${entry.proficiency.trim()})` : entry.name.trim()))
                .join("  •  "),
        );
    }

    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.muted);
        doc.text(`Page ${page} of ${pageCount}`, pageWidth - PAGE_MARGIN, pageHeight - 24, { align: "right" });
    }

    doc.save(buildFileName(profile));
};
