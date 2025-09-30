import React from 'react';
import type { Product } from '@/types/product';
import type { Store } from '@/types/store';

interface StructuredDataProps {
  data: OrganizationSchema | ProductSchema | LocalBusinessSchema | BreadcrumbSchema | WebSiteSchema;
}

export type OrganizationSchema = {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description?: string;
  sameAs?: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone?: string;
    contactType: string;
    email?: string;
  };
};

export type ProductSchema = {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description: string;
  image: string[];
  sku?: string;
  brand?: {
    '@type': 'Brand';
    name: string;
  };
  offers: {
    '@type': 'Offer';
    url: string;
    priceCurrency: string;
    price: number;
    availability: string;
    seller: {
      '@type': 'Organization';
      name: string;
    };
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
};

export type LocalBusinessSchema = {
  '@context': 'https://schema.org';
  '@type': 'Store' | 'ClothingStore';
  name: string;
  description?: string;
  image: string;
  '@id': string;
  url: string;
  telephone?: string;
  address?: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  openingHoursSpecification?: Array<{
    '@type': 'OpeningHoursSpecification';
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }>;
};

export type BreadcrumbSchema = {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
};

export type WebSiteSchema = {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
};

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      suppressHydrationWarning
    />
  );
}

// Helper functions to generate structured data

export function generateOrganizationSchema(baseUrl: string): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EasyFit',
    url: baseUrl,
    logo: `${baseUrl}/main-logo.png`,
    description: 'Plataforma de e-commerce que permite probar ropa antes de comprar. Moda argentina con envío gratis.',
    sameAs: [
      // Add your social media URLs here
      // 'https://www.facebook.com/easyfit',
      // 'https://www.instagram.com/easyfit',
      // 'https://twitter.com/easyfit',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'info@easyfit.com.ar',
    },
  };
}

export function generateProductSchema(product: Product, store: Store, baseUrl: string): ProductSchema {
  const availability = product.variants?.some((v) => v.stock > 0)
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  const images =
    product.variants
      ?.flatMap((v) => v.images)
      .filter((img) => !!img)
      .map((img) => img.key)
      .slice(0, 5) || []; // Limit to 5 images

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || `${product.title} - ${store.name}`,
    image: images,
    sku: product._id,
    brand: {
      '@type': 'Brand',
      name: store.name,
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/${store.slug}/${product.slug}`,
      priceCurrency: 'ARS',
      price: product.minPrice || 0,
      availability,
      seller: {
        '@type': 'Organization',
        name: store.name,
      },
    },
  };
}

export function generateLocalBusinessSchema(store: Store, baseUrl: string): LocalBusinessSchema {
  const schema: LocalBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: store.name,
    description: store.description,
    image: store.bannerUrl || `${baseUrl}/logo-stores.jpg`,
    '@id': `${baseUrl}/${store.slug}#store`,
    url: `${baseUrl}/${store.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AR',
      ...(store.location?.address && { streetAddress: store.location.address }),
      ...(store.location?.city && { addressLocality: store.location.city }),
      ...(store.location?.state && { addressRegion: store.location.state }),
    },
  };

  // Add geolocation if available
  if (store.location?.coordinates?.[0] && store.location?.coordinates?.[1]) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: store.location.coordinates[1],
      longitude: store.location.coordinates[0],
    };
  }

  // Add contact info if available
  if (store.contactInfo?.phone) {
    schema.telephone = store.contactInfo.phone;
  }

  return schema;
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url?: string }>): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}

export function generateWebSiteSchema(baseUrl: string): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'EasyFit',
    url: baseUrl,
    description: 'Probá ropa en casa antes de comprar. Moda argentina online.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
