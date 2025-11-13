"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replacePlaceholders = void 0;
const replacePlaceholders = (template, replacements) => {
    if (typeof template !== 'string') {
        throw new Error('Template must be a string');
    }
    if (typeof replacements !== 'object' || replacements === null) {
        throw new Error('Replacements must be a valid object');
    }
    return template.replace(/%\w+%/g, (placeholder) => {
        // Extract key (e.g., %area% => 'area')
        const key = placeholder.slice(1, -1);
        // Return the corresponding value or an empty string if missing/empty
        return replacements[key] != null ? String(replacements[key]) : '';
    });
};
exports.replacePlaceholders = replacePlaceholders;
// Example usage
const template = 'Welcome to %area%, located in %city%. Explore %location% now!';
const replacements = {
    area: 'Manhattan',
    city: 'New York',
    location: '' // Empty value will remove the placeholder
};
const result = (0, exports.replacePlaceholders)(template, replacements); // "Welcome to Manhattan, located in New York. Explore now!"
//# sourceMappingURL=ReplaceText.service.js.map