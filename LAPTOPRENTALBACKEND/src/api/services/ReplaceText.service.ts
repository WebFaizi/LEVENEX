
export const replacePlaceholders = (
    template: string,
    replacements: Record<string, string | number | undefined | null>
): string => {
    if (typeof template !== 'string') {
        throw new Error('Template must be a string');
    }

    if (typeof replacements !== 'object' || replacements === null) {
        throw new Error('Replacements must be a valid object');
    }

    return template.replace(/%\w+%/g, (placeholder: string) => {
        // Extract key (e.g., %area% => 'area')
        const key = placeholder.slice(1, -1);

        // Return the corresponding value or an empty string if missing/empty
        return replacements[key] != null ? String(replacements[key]) : '';
    });
};

// Example usage
const template = 'Welcome to %area%, located in %city%. Explore %location% now!';
const replacements = {
    area: 'Manhattan',
    city: 'New York',
    location: '' // Empty value will remove the placeholder
};

const result = replacePlaceholders(template, replacements); // "Welcome to Manhattan, located in New York. Explore now!"
