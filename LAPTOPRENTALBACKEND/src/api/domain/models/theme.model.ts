import ThemeSchema from "../schema/theme.schema"; 

interface themeInterface{
    theme_name:string;
    page_name:string;
    page_content:string;
    static_page_id?:string;
}

export const storeThemeModel = async (themaData: themeInterface, callback: (error: any, result: any) => void) => {
    try {
        const theme = new ThemeSchema(themaData);
        const result = await theme.save();
        return callback(null, { result });
    } catch (error) {
        return callback(error, null);
    }
}