import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { GetProductsResponse, ProductFilterOptions } from '@/types/product';

interface UseInfiniteProductsOptions extends ProductFilterOptions {
  enabled?: boolean;
}

export const useInfiniteProducts = (options: UseInfiniteProductsOptions = {}) => {
  const { enabled = true, ...filters } = options;

  return useInfiniteQuery<GetProductsResponse>({
    queryKey: ['products', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => {
      const queryOptions = {
        ...filters,
        page: pageParam as number,
        limit: 20, // Keep consistent with backend default
      };
      return api.products.getProducts(queryOptions);
    },
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      if (pagination.page < pagination.pages) {
        return pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

// Helper hook to get all products from infinite query
export const useInfiniteProductsData = (options: UseInfiniteProductsOptions = {}) => {
  const query = useInfiniteProducts(options);

  const allProducts = query.data?.pages.flatMap(page => page.data.products) ?? [];

  return {
    ...query,
    products: allProducts,
    totalProducts: query.data?.pages[0]?.pagination.total ?? 0,
  };
};