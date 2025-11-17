export const slugify = (str: string): string => {
    return str
      .toLowerCase() // Convert to lowercase
      .normalize("NFD") // Normalize special Unicode characters (e.g., é → e)
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics (accents)
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
      .replace(/^-+|-+$/g, ""); // Trim hyphens from start and end
  };
  