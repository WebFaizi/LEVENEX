import productSchema from "../domain/schema/product.schema";

export const getProductById = async (
  product_id: any | null
): Promise<object> => {
  try {
    const baseUrl = process.env.BASE_URL;
    if (!product_id) {
      return { error: "Product ID is required" };
    }

    const product_details = await productSchema
      .findOne({ unique_id: product_id })
      .exec();    

    if (!product_details) {
      return { error: "Product not found" };
    }

    if (Array.isArray(product_details.product_images)) {
      product_details.product_images = product_details.product_images.map(
        (img: string) => {
          const normalizedPath = img.replace(/\\/g, "/");
          return `${baseUrl}${normalizedPath}`;
        }
      );
    }       
    return product_details;
  } catch (error) {
    console.error("Error fetching product details:", error);
    return { error: "Failed to fetch product details" };
  }
};

export default getProductById;
