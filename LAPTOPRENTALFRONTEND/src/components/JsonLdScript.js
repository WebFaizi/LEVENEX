// // components/SEO/JsonLdScript.js
// export default function JsonLdScript({ data, id }) {
//   if (!data) return null;

//   return (
//     <script
//       type="application/ld+json"
//       id={id}
//       dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
//     />
//   );
// }



"use client";
import Script from 'next/script';

export default function JsonLdScript({ data, id }) {
  if (!data) return null;
  
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
}
