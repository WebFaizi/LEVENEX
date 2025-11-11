"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import JsonLdScript from "@/components/JsonLdScript";

export default function ProductListing({ data }) {
  const router = useRouter();
  const [schemas, setSchemas] = useState([]);

  useEffect(() => {
    const generatedSchemas = [];
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://laptoprental.co';

    // Combined Location and Business Schema
    if (data?.category_details) {
      const location = data?.current_location || {};
      const category = data.category_details;
      
      generatedSchemas.push({
        id: "business-location-schema",
        data: {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": `${baseUrl}${window?.location?.pathname || ''}`,
          "name": `Laptop Rental in ${location.area_name ? `${location.area_name}, ${location.city_name}` : 'Mumbai'}`,
          "image": [
            `${baseUrl}/${category.desktop_image}`,
            `${baseUrl}/${category.mobile_image}`
          ],
          "description": category.page_top_description || "Laptop Rental Services",
          "url": `${baseUrl}${window?.location?.pathname || ''}`,
          "telephone": "+91-8888888888",
          "priceRange": "₹₹",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": location.area_name || "",
            "addressLocality": location.area_name || "Mumbai",
            "addressRegion": location.city_name || "Maharashtra",
            "addressCountry": "IN",
            "postalCode": location.pincode || "400001"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": location.latitude || "19.0760",
            "longitude": location.longitude || "72.8777"
          },
          "openingHours": ["Mo-Su 00:00-23:59"],
          "sameAs": [
            "https://www.facebook.com/laptoprental.co",
            "https://twitter.com/laptoprentalco",
            "https://www.instagram.com/laptoprentalco"
          ],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": category.ratingvalue || "4.5",
            "ratingCount": category.ratingcount || "60000",
            "bestRating": "5",
            "worstRating": "1"
          },
          "review": [
            {
              "@type": "Review",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5",
                "worstRating": "1"
              },
              "author": {
                "@type": "Person",
                "name": "Rahul Sharma"
              },
              "reviewBody": "Excellent laptop rental service in Mumbai. The laptops were in perfect condition and delivery was on time.",
              "datePublished": "2025-10-01"
            },
            {
              "@type": "Review",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "4",
                "bestRating": "5",
                "worstRating": "1"
              },
              "author": {
                "@type": "Person",
                "name": "Priya Patel"
              },
              "reviewBody": "Very professional service. Good variety of laptops available for rent.",
              "datePublished": "2025-09-15"
            }
          ]
        }
      });
    }

    if (data?.products?.data && data.products.data.length > 0) {
      // ItemList Schema with embedded Product data - This fixes the ListItem duplication error
      generatedSchemas.push({
        id: "product-list-schema",
        data: {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "url": `${baseUrl}${window?.location?.pathname || ''}`,
          "numberOfItems": data.products.data.length,
          "name": data.current_location?.area_name 
            ? `Available Laptops for Rent in ${data.current_location.area_name}, ${data.current_location.city_name}`
            : `Available Laptops for Rent in ${data.current_location?.city_name || 'Mumbai'}`,
          "itemListElement": data.products.data.map((product, index) => {
            const productName = product.product_name?.trim().toLowerCase().replace(/\s+/g, "-") || `product-${index + 1}`;
            const productUrl = `${baseUrl}/pro-${productName}-${product.unique_id}`;
            
            return {
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Product",
                "@id": productUrl,
                "url": productUrl,
                "name": product.product_name || `Product ${index + 1}`,
                "image": product.product_images?.[1] 
                  ? `${baseUrl}${product.product_images[1]}` 
                  : `${baseUrl}/assets/default-featured-image.png`,
                "description": product.description || `Rent ${product.product_name || 'laptop'}`,
                "brand": {
                  "@type": "Brand",
                  "name": product.brand || "Multiple Brands Available"
                },
                "offers": {
                  "@type": "Offer",
                  "url": productUrl,
                  "availability": "https://schema.org/InStock",
                  "price": product.product_price?.replace(/[^0-9.]/g, '') || "1800",
                  "priceCurrency": "INR",
                  "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  "itemCondition": "https://schema.org/UsedCondition"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.5",
                  "reviewCount": "50",
                  "bestRating": "5",
                  "worstRating": "1"
                }
              }
            };
          })
        }
      });
    }

    setSchemas(generatedSchemas);
  }, [data]);

  const handleProductDetailRedirect = (data) => {
    const productName = data?.product_name
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const productSlug = `pro-${productName}-${data?.unique_id}`;

    router.push(`/${productSlug}`);
  };
  return (
    <>
      {schemas.map(schema => (
        <JsonLdScript key={schema.id} data={schema.data} />
      ))}
      <ul className="list-none grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
        {data?.products?.data.map((product, index) => (
          <li className="flex flex-col" key={index}>
            <Button
            variant="ghost"
              className="h-auto 2xl:h-auto flex-col cursor-pointer shadow-xl bg-white rounded-md overflow-hidden p-2.5 md:p-4 xl:p-5 gap-x-3.5 sm:gap-x-6 grow hover:scale-103 active:scale-95 active:shadow-none"
              onClick={() => handleProductDetailRedirect(product)}
            >
              <div className="block w-full relative rounded-md overflow-hidden after:pt-[75%] xl:after:pt-[100%] after:block after:w-full">
                <Image
                  alt={product.product_name}
                  className="block max-w-full w-full h-full absolute top-0 left-0 object-cover "
                  src={product.product_images[1] || "/assets/default-featured-image.png"}
                  width={200}
                  height={200}
                />
              </div>
              <div className="shrink w-full flex flex-col gap-y-2">
                <h3 className="text-xs sm:text-base lg:text-lg font-semibold text-gray-800 ellips-2 ">
                  {product.product_name}
                </h3>
                <p className="text-xs sm:text-xs text-gray-600">
                  {product.product_price}
                </p>
              </div>
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}
