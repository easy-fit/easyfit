import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import { Providers } from '@/providers/providers';
import { Toaster } from 'sonner';
import { ConditionalFooter } from '@/components/layout/conditional-footer';
import { StructuredData, generateOrganizationSchema, generateWebSiteSchema } from '@/components/seo/StructuredData';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://easyfit.com.ar'),
  title: {
    default: 'EasyFit - Probá antes de comprar | Ropa Online Argentina',
    template: '%s | EasyFit',
  },
  description:
    'Comprá ropa online y probala en casa antes de pagar. Elegí tu tienda favorita, recibí los productos y pagá solo por lo que te quedás. Moda con prueba gratis en Argentina.',
  keywords: [
    'ropa online',
    'comprar ropa online argentina',
    'tienda de ropa',
    'probador virtual',
    'probar ropa en casa',
    'moda argentina',
    'ropa mujer',
    'ropa hombre',
    'e-commerce ropa',
    'try before you buy',
    'compra segura',
  ],
  authors: [{ name: 'EasyFit' }],
  creator: 'EasyFit',
  publisher: 'EasyFit',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/',
    siteName: 'EasyFit',
    title: 'EasyFit - Probá antes de comprar | Ropa Online Argentina',
    description:
      'Comprá ropa online y probala en casa antes de pagar. Elegí tu tienda favorita, recibí los productos y pagá solo por lo que te quedás.',
    images: [
      {
        url: '/main-logo.png',
        width: 1200,
        height: 630,
        alt: 'EasyFit - Probá antes de comprar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EasyFit - Probá antes de comprar | Ropa Online Argentina',
    description: 'Comprá ropa online y probala en casa. Pagá solo por lo que te quedás.',
    images: ['/main-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'pJsWjY17fP6fKkXTTfyPZ7VwyJB8vcHoJRlR5PYqKBM',
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://easyfit.com.ar';

  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#9EE493" />
        <meta name="application-name" content="EasyFit" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EasyFit" />
        <meta name="facebook-domain-verification" content="094yi8dl5uwn3n6l4szdooiotf731t" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Structured Data for Organization and Website */}
        <StructuredData data={generateOrganizationSchema(baseUrl)} />
        <StructuredData data={generateWebSiteSchema(baseUrl)} />

        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '790856756771177');
fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=790856756771177&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
        {/* Google Analytics scripts */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-RQJZH2YLDV" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-RQJZH2YLDV');
      `}
        </Script>
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">{children}</main>
            <ConditionalFooter />
          </div>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
