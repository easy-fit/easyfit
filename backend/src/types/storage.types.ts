export interface FileItem {
  key: string;
  contentType: string;
}

export interface SignUrlsRequest {
  bucket: string;
  typePrefix: 'products' | 'returns' | 'assets';
  files: FileItem[];
}

export interface SignedUrlResult {
  key_img: string;
  url: string;
}
