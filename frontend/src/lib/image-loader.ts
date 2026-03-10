interface ImageLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

export default function imageLoader({ src, width, quality }: ImageLoaderParams): string {
  // For local/relative images (e.g. /main-logo.png), serve directly
  if (src.startsWith('/')) {
    return src;
  }

  // For remote images, use wsrv.nl (free image CDN/proxy)
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: (quality || 75).toString(),
    output: 'webp',
  });

  return `https://wsrv.nl/?${params.toString()}`;
}
