"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = void 0;
const slugify = (str) => {
    return str
        .toLowerCase() // Convert to lowercase
        .normalize("NFD") // Normalize special Unicode characters (e.g., é → e)
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics (accents)
        .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
        .replace(/^-+|-+$/g, ""); // Trim hyphens from start and end
};
exports.slugify = slugify;
//# sourceMappingURL=slugify.js.map