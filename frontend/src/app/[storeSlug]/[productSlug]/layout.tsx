import { Metadata } from 'next';
import { ENV } from '@/config/env';
import { StructuredData, generateProductSchema, generateBreadcrumbSchema } from '@/components/seo/StructuredData';

async function fetchProductData(storeSlug: string, productSlug: string) {
  try {
    const [productRes, storeRes] = await Promise.all([
      fetch(`${ENV.API_URL}/stores/${storeSlug}/${productSlug}`, {
        cache: 'no-store',
      }),
      fetch(`${ENV.API_URL}/stores/slug/${storeSlug}`, {
        cache: 'no-store',
      }),
    ]);

    if (!productRes.ok || !storeRes.ok) return null;

    const [productData, storeData] = await Promise.all([productRes.json(), storeRes.json()]);

    return {
      product: productData.data,
      store: storeData.data,
    };
  } catch (error) {
    console.error('Error fetching product data for metadata:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string; productSlug: string }>;
}): Promise<Metadata> {
  const { storeSlug, productSlug } = await params;
  const data = await fetchProductData(storeSlug, productSlug);
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://easyfit.com.ar';

  if (!data || !data.product || !data.store) {
    return {
      title: 'Producto no encontrado',
      description: 'El producto que buscás no está disponible.',
    };
  }

  const { product, store } = data;
  const productUrl = `${baseUrl}/${storeSlug}/${productSlug}`;

  // Get the first image from variants
  const images =
    product.variants
      ?.flatMap((v: any) => v.images)
      .filter((img: any) => !!img)
      .map((img: any) => img.key)
      .slice(0, 3) || [];

  const title = `${product.title} - ${store.name}`;
  const description =
    product.description ||
    `Comprá ${product.title} en ${store.name}. Probalo en casa antes de pagar. Envío gratis y devolución sin cargo.`;

  return {
    title,
    description,
    keywords: [product.title, store.name, product.category, 'ropa online', 'comprar ropa', 'probar en casa'].filter(
      Boolean,
    ),
    openGraph: {
      title,
      description,
      type: 'website',
      url: productUrl,
      siteName: 'EasyFit',
      images: images.map((img: string) => ({
        url: img,
        width: 800,
        height: 800,
        alt: product.title,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.slice(0, 1),
    },
    alternates: {
      canonical: productUrl,
    },
  };
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string; productSlug: string }>;
}) {
  const { storeSlug, productSlug } = await params;
  return (
    <>
      {children}
      <ProductStructuredData storeSlug={storeSlug} productSlug={productSlug} />
    </>
  );
}

async function ProductStructuredData({ storeSlug, productSlug }: { storeSlug: string; productSlug: string }) {
  const data = await fetchProductData(storeSlug, productSlug);
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://easyfit.com.ar';

  if (!data || !data.product || !data.store) return null;

  const { product, store } = data;

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Inicio', url: baseUrl },
    { name: store.name, url: `${baseUrl}/${storeSlug}` },
    { name: product.title },
  ]);

  // Generate product schema
  const productSchema = generateProductSchema(product, store, baseUrl);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={productSchema} />
    </>
  );
}
