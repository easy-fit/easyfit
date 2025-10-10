import { Metadata } from 'next';
import { ENV } from '@/config/env';
import {
  StructuredData,
  generateLocalBusinessSchema,
  generateBreadcrumbSchema,
} from '@/components/seo/StructuredData';

async function fetchStoreData(storeSlug: string) {
  try {
    const response = await fetch(`${ENV.API_URL}/stores/${storeSlug}`, {
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching store data for metadata:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}): Promise<Metadata> {
  const { storeSlug } = await params;
  const store = await fetchStoreData(storeSlug);
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://easyfit.com.ar';

  if (!store) {
    return {
      title: 'Tienda no encontrada',
      description: 'La tienda que buscás no está disponible.',
    };
  }

  const storeUrl = `${baseUrl}/${storeSlug}`;
  const title = `${store.name} - Ropa Online | EasyFit`;
  const description =
    store.description ||
    `Comprá en ${store.name}. Probá la ropa en casa antes de pagar. Envío gratis y devolución sin cargo. Descubrí los mejores productos de moda.`;

  return {
    title,
    description,
    keywords: [
      store.name,
      'tienda de ropa',
      'ropa online',
      'comprar ropa',
      'moda argentina',
      ...store.tags,
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: 'website',
      url: storeUrl,
      siteName: 'EasyFit',
      images: store.bannerUrl
        ? [
            {
              url: store.bannerUrl,
              width: 1200,
              height: 630,
              alt: `${store.name} - Tienda online`,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: store.bannerUrl ? [store.bannerUrl] : [],
    },
    alternates: {
      canonical: storeUrl,
    },
  };
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  return (
    <>
      {children}
      <StoreStructuredData storeSlug={storeSlug} />
    </>
  );
}

async function StoreStructuredData({ storeSlug }: { storeSlug: string }) {
  const store = await fetchStoreData(storeSlug);
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://easyfit.com.ar';

  if (!store) return null;

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Inicio', url: baseUrl },
    { name: store.name },
  ]);

  // Generate local business schema
  const businessSchema = generateLocalBusinessSchema(store, baseUrl);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={businessSchema} />
    </>
  );
}