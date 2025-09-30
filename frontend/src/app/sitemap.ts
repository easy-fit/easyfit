import { MetadataRoute } from 'next';
import { ENV } from '@/config/env';

async function fetchStores() {
  try {
    const response = await fetch(`${ENV.API_URL}/stores`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.data?.stores || [];
  } catch (error) {
    console.error('Error fetching stores for sitemap:', error);
    return [];
  }
}

async function fetchProducts() {
  try {
    const response = await fetch(`${ENV.API_URL}/products?limit=1000`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.data?.products || [];
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://easyfit.com.ar';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about/sobre-nosotros`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about/preguntas-frecuentes`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about/terminos-y-condiciones`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/about/politicas-de-privacidad`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/about/centro-de-ayuda`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Fetch dynamic content
  const [stores, products] = await Promise.all([fetchStores(), fetchProducts()]);

  // Store pages
  const storePages: MetadataRoute.Sitemap = stores.map((store: any) => ({
    url: `${baseUrl}/${store.slug}`,
    lastModified: new Date(store.updatedAt || store.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Product pages
  const productPages: MetadataRoute.Sitemap = products.map((product: any) => ({
    url: `${baseUrl}/${product.storeSlug}/${product.slug}`,
    lastModified: new Date(product.updatedAt || product.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...storePages, ...productPages];
}