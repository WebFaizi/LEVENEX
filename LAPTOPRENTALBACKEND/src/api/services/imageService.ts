import sharp from "sharp";
import path from "path";
import fs from "fs";

export const convertToWebpAndSave = async (
    buffer: Buffer,
    originalName: string,
    uploadDir: string
): Promise<string> => {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const baseName = path.parse(originalName).name;
    const fileName = `${Date.now()}-${baseName}.webp`;
    const savePath = path.join(uploadDir, fileName);

    await sharp(buffer)
        .webp({ quality: process.env.SHARP_QUALITY ? parseInt(process.env.SHARP_QUALITY) : 80 })
        .toFile(savePath);

    return savePath;
};
