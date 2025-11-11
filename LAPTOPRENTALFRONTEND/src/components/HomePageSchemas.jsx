"use client";
import { useEffect, useState } from "react";
import JsonLdScript from "@/components/JsonLdScript";
import { useSelector } from "react-redux";

export default function HomePageSchemas() {
  const [schemas, setSchemas] = useState([]);
  const categories = useSelector((state) => state.setting.category);
  const searchValue = useSelector((state) => state.setting.searchvalue);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const baseUrl = window.location.origin;
    const generatedSchemas = [];

    // 1. Organization Schema (Main Business)
    generatedSchemas.push({
      id: "organization-schema",
      data: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "Laptop Rental",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`,
          "width": "200",
          "height": "60"
        },
        "image": `${baseUrl}/logo.png`,
        "description": "Premium Laptop Rental Services - Rent MacBook Pro, MacBook Air, and other laptops for events, businesses, and personal use across India",
        "email": "support@laptoprental.co",
        "telephone": "+91-8888888888",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": searchValue?.area_name || "Mumbai Central",
          "addressLocality": searchValue?.area_name || "Mumbai",
          "addressRegion": searchValue?.city_name || "Maharashtra",
          "postalCode": searchValue?.pincode || "400001",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": searchValue?.latitude || "19.0760",
          "longitude": searchValue?.longitude || "72.8777"
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+91-8888888888",
            "contactType": "customer service",
            "areaServed": "IN",
            "availableLanguage": ["English", "Hindi"]
          },
          {
            "@type": "ContactPoint",
            "telephone": "+91-8888888888",
            "contactType": "sales",
            "areaServed": "IN",
            "availableLanguage": ["English", "Hindi"]
          }
        ],
        "sameAs": [
          "https://www.facebook.com/laptoprental.co",
          "https://twitter.com/laptoprentalco",
          "https://www.instagram.com/laptoprentalco",
          "https://www.linkedin.com/company/laptoprental",
          "https://www.youtube.com/@laptoprental"
        ],
        "founder": {
          "@type": "Person",
          "name": "Laptop Rental Team"
        },
        "foundingDate": "2020",
        "numberOfEmployees": {
          "@type": "QuantitativeValue",
          "value": "50"
        },
        "slogan": "Rent Smart, Work Smart"
      }
    });

    // 2. Local Business Schema
    generatedSchemas.push({
      id: "local-business-schema",
      data: {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": `${baseUrl}/#localbusiness`,
        "name": `Laptop Rental - ${searchValue?.city_name || 'Mumbai'}`,
        "image": [
          `${baseUrl}/logo.png`,
          `${baseUrl}/assets/laptop-rental-service.jpg`
        ],
        "description": `Professional laptop rental services in ${searchValue?.city_name || 'Mumbai'}. Rent MacBook Pro, MacBook Air, gaming laptops, and business laptops with flexible rental plans.`,
        "url": baseUrl,
        "telephone": "+91-8888888888",
        "priceRange": "₹₹",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": searchValue?.area_name || "Multiple Locations",
          "addressLocality": searchValue?.area_name || "Mumbai",
          "addressRegion": searchValue?.city_name || "Maharashtra",
          "addressCountry": "IN",
          "postalCode": searchValue?.pincode || "400001"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": searchValue?.latitude || "19.0760",
          "longitude": searchValue?.longitude || "72.8777"
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday"
            ],
            "opens": "00:00",
            "closes": "23:59"
          }
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.7",
          "reviewCount": "50000",
          "bestRating": "5",
          "worstRating": "1"
        },
        "review": [
          {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "author": {
              "@type": "Person",
              "name": "Rajesh Kumar"
            },
            "reviewBody": "Excellent laptop rental service! Got a MacBook Pro delivered within hours for my project. Highly recommend for business professionals.",
            "datePublished": "2025-10-15"
          },
          {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "author": {
              "@type": "Person",
              "name": "Priya Sharma"
            },
            "reviewBody": "Great experience renting laptops for our corporate event. Professional service and quality equipment.",
            "datePublished": "2025-09-28"
          },
          {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "4",
              "bestRating": "5"
            },
            "author": {
              "@type": "Person",
              "name": "Amit Patel"
            },
            "reviewBody": "Quick delivery and hassle-free rental process. The laptop was in perfect condition.",
            "datePublished": "2025-10-05"
          }
        ],
        "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "UPI", "Net Banking"],
        "currenciesAccepted": "INR",
        "areaServed": {
          "@type": "GeoCircle",
          "geoMidpoint": {
            "@type": "GeoCoordinates",
            "latitude": searchValue?.latitude || "19.0760",
            "longitude": searchValue?.longitude || "72.8777"
          },
          "geoRadius": "50000"
        }
      }
    });

    // 3. Website Schema
    generatedSchemas.push({
      id: "website-schema",
      data: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": "Laptop Rental",
        "description": "Premium Laptop Rental Services across India",
        "publisher": {
          "@id": `${baseUrl}/#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${baseUrl}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        },
        "inLanguage": "en-IN"
      }
    });

    // 4. BreadcrumbList Schema for Homepage
    generatedSchemas.push({
      id: "breadcrumb-schema",
      data: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          }
        ]
      }
    });

    // 5. ItemList Schema for Categories (Carousel)
    if (categories && categories.length > 0) {
      generatedSchemas.push({
        id: "categories-carousel-schema",
        data: {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Laptop Rental Categories",
          "description": "Browse our comprehensive laptop rental categories",
          "numberOfItems": categories.length,
          "itemListElement": categories.map((category, index) => {
            const categorySlug = category.name
              ?.toLowerCase()
              .replace(/[^a-z0-9]/g, "-")
              .replace(/-+/g, "-")
              .replace(/^-|-$/g, "");
            
            return {
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Thing",
                "name": category.name,
                "url": category.current_url ? `${baseUrl}${category.current_url}` : `${baseUrl}/${categorySlug}`,
                "image": category.mobile_image || category.desktop_image,
                "description": `Explore ${category.name} rental options`
              }
            };
          })
        }
      });
    }

    // 7. FAQPage Schema (Common Questions)
    generatedSchemas.push({
      id: "faq-schema",
      data: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does laptop rental work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Browse our categories, select your desired laptop, choose rental duration, place your order, and we'll deliver it to your location. Return it after your rental period ends."
            }
          },
          {
            "@type": "Question",
            "name": "What is the minimum rental period?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We offer flexible rental periods starting from 1 day to long-term rentals of several months."
            }
          },
          {
            "@type": "Question",
            "name": "Do you provide delivery and pickup?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, we provide free delivery and pickup services across major cities in India."
            }
          },
          {
            "@type": "Question",
            "name": "What happens if the laptop gets damaged?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "All rentals include basic insurance. Additional accidental damage protection is available at checkout."
            }
          },
          {
            "@type": "Question",
            "name": "Can I extend my rental period?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, you can easily extend your rental period by contacting our support team before the rental end date."
            }
          }
        ]
      }
    });

    setSchemas(generatedSchemas);
  }, [categories, searchValue]);

  return (
    <>
      {schemas.map((schema) => (
        <JsonLdScript key={schema.id} id={schema.id} data={schema.data} />
      ))}
    </>
  );
}
