'use client';

import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Clock, Shield } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { StoreCard } from '@/components/home/store-card';
import { ProductCard } from '@/components/home/product-card';
import { Filters } from '@/components/home/filters';
import { CategoryNavigation } from '@/components/home/category-navigation';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/api/use-products';
import { useInfiniteProductsData } from '@/hooks/api/use-infinite-products';
import { useStores } from '@/hooks/api/use-stores';
import { InfiniteScrollTrigger } from '@/components/ui/infinite-scroll-trigger';
import type { StoreFilterOptions } from '@/types/store';
import type { ProductFilterOptions } from '@/types/product';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilters, setProductFilters] = useState<ProductFilterOptions>({});
  const [storeFilters, setStoreFilters] = useState<StoreFilterOptions>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'stores' | 'products'>('stores');

  // Combine search query with filters
  const combinedProductFilters: ProductFilterOptions = {
    ...productFilters,
    ...(searchQuery && { search: searchQuery }),
  };

  const combinedStoreFilters: StoreFilterOptions = {
    ...storeFilters,
    ...(searchQuery && { search: searchQuery }),
  };

  // API calls - use infinite products for better performance
  const {
    products: allProducts,
    totalProducts,
    isLoading: productsLoading,
    error: productsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProductsData({
    ...(viewMode === 'products' ? combinedProductFilters : {}),
    enabled: viewMode === 'products',
  });

  const {
    data: storesData,
    isLoading: storesLoading,
    error: storesError,
  } = useStores(viewMode === 'stores' ? combinedStoreFilters : undefined);

  // Switch to products view when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      setViewMode('products');
    }
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleProductFiltersChange = (filters: ProductFilterOptions) => {
    setProductFilters(filters);
  };

  const handleStoreFiltersChange = (filters: StoreFilterOptions) => {
    setStoreFilters(filters);
  };

  const handleCategoryChange = (category: string | undefined) => {
    setProductFilters({ ...productFilters, category });
    setViewMode('products'); // Switch to products view when category is selected
  };

  // Products are already processed by the infinite hook with shuffling logic
  const displayedProducts = allProducts;

  const isLoading = viewMode === 'products' ? productsLoading : storesLoading;
  const hasError = viewMode === 'products' ? productsError : storesError;

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Header onSearch={handleSearch} searchQuery={searchQuery} />

      <main className="container mx-auto px-4 py-6">
        {/* Hero Section - Hide when searching */}
        {!searchQuery && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-[#20313A] mb-3 font-helvetica">
                Descubrí las mejores tiendas de ropa
              </h1>
              <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed font-satoshi">
                Probá antes de comprar. Elegí tu tienda favorita, pedí lo que te gusta y pagá solo por lo que te quedás.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-100">
                <div className="bg-[#DBF7DC] p-2 rounded-full">
                  <Sparkles className="h-5 w-5 text-[#20313A]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#20313A]">Probá en casa</h3>
                  <p className="text-xs text-gray-500">Sin compromiso de compra</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-100">
                <div className="bg-[#DBF7DC] p-2 rounded-full">
                  <Clock className="h-5 w-5 text-[#20313A]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#20313A]">Tiempo flexible</h3>
                  <p className="text-xs text-gray-500">Decidí con calma</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-100">
                <div className="bg-[#DBF7DC] p-2 rounded-full">
                  <Shield className="h-5 w-5 text-[#20313A]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#20313A]">Pago seguro</h3>
                  <p className="text-xs text-gray-500">Solo por lo que elegís</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Toggle and Search Results Header */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-4">
            {searchQuery ? (
              <div>
                <h2 className="text-xl font-bold text-[#20313A] font-helvetica">
                  Resultados para &quot;{searchQuery}&quot;
                </h2>
                <p className="text-gray-600 text-sm">
                  {viewMode === 'products'
                    ? `${totalProducts || 0} productos encontrados`
                    : `${storesData?.results || 0} tiendas encontradas`}
                </p>
              </div>
            ) : (
              <h2 className="text-xl font-bold text-[#20313A] font-helvetica">
                {viewMode === 'stores' ? 'Tiendas destacadas' : 'Productos destacados'}
              </h2>
            )}

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'stores' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('stores')}
                className={
                  viewMode === 'stores' ? 'bg-[#9EE493] text-[#20313A] hover:bg-[#8BD480]' : 'hover:bg-gray-200'
                }
              >
                Tiendas
              </Button>
              <Button
                variant={viewMode === 'products' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('products')}
                className={
                  viewMode === 'products' ? 'bg-[#9EE493] text-[#20313A] hover:bg-[#8BD480]' : 'hover:bg-gray-200'
                }
              >
                Productos
              </Button>
            </div>
          </div>

          {/* Category Navigation - Only show for products view */}
          {viewMode === 'products' && (
            <CategoryNavigation
              selectedCategory={combinedProductFilters.category}
              onCategoryChange={handleCategoryChange}
            />
          )}

          {/* Filters */}
          <Filters
            filters={viewMode === 'products' ? combinedProductFilters : combinedStoreFilters}
            onFiltersChange={viewMode === 'products' ? handleProductFiltersChange : handleStoreFiltersChange}
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
            type={viewMode}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Hubo un error al cargar los datos</p>
            <Button onClick={() => window.location.reload()} className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]">
              Reintentar
            </Button>
          </div>
        )}

        {/* Content Grid */}
        {!isLoading && !hasError && (
          <>
            {viewMode === 'products' && displayedProducts.length > 0 && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Infinite scroll trigger */}
                {hasNextPage && (
                  <InfiniteScrollTrigger
                    onIntersect={fetchNextPage}
                    loading={isFetchingNextPage}
                    disabled={!hasNextPage}
                  />
                )}

                {/* Loading more indicator */}
                {isFetchingNextPage && (
                  <div className="flex justify-center py-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                          <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-3"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Load more fallback button */}
                {!isFetchingNextPage && hasNextPage && (
                  <div className="flex justify-center py-8">
                    <Button
                      onClick={() => fetchNextPage()}
                      variant="outline"
                      className="border-[#2F4858] text-[#2F4858] hover:bg-[#DBF7DC]"
                    >
                      Cargar más productos
                    </Button>
                  </div>
                )}
              </>
            )}

            {viewMode === 'stores' && storesData?.data?.stores && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {storesData.data.stores.map((store) => (
                  <StoreCard
                    key={store._id}
                    store={{
                      ...store,
                      approximateDeliveryTime: store.approximateDeliveryTime ?? 25,
                      approximateShippingCost: store.approximateShippingCost ?? 1600,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {((viewMode === 'products' && displayedProducts.length === 0) ||
              (viewMode === 'stores' && storesData?.data?.stores.length === 0)) && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  {searchQuery
                    ? `No se encontraron ${viewMode === 'products' ? 'productos' : 'tiendas'} para "${searchQuery}"`
                    : `No hay ${viewMode === 'products' ? 'productos' : 'tiendas'} disponibles`}
                </p>
                {searchQuery && (
                  <Button
                    onClick={() => setSearchQuery('')}
                    variant="outline"
                    className="border-[#2F4858] text-[#2F4858] hover:bg-[#DBF7DC]"
                  >
                    Limpiar búsqueda
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
