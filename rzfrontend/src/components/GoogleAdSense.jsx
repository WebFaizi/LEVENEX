"use client";

import Script from "next/script";
import { useEffect } from "react";

// AdSense Banner Component
export function AdSenseBanner({ adSlot, adFormat = "auto", fullWidthResponsive = true, style = {} }) {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive}
    ></ins>
  );
}

// AdSense Script Loader Component
export function GoogleAdSenseScript({ clientId }) {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onLoad={() => {
        console.log('✅ Google AdSense script loaded successfully');
      }}
      onError={(error) => {
        console.error('❌ Failed to load Google AdSense script:', error);
      }}
    />
  );
}

// Complete AdSense Setup Component
export default function GoogleAdSense({ clientId, children }) {
  return (
    <>
      <GoogleAdSenseScript clientId={clientId} />
      {children}
    </>
  );
}