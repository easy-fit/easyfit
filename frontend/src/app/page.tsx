'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { StoreCard } from '@/components/home/store-card';
import { ProductCard } from '@/components/home/product-card';
import { Filters } from '@/components/home/filters';
import { GenderHeroSelection } from '@/components/home/gender-hero-selection';
import { CategorySidebar } from '@/components/home/category-sidebar';
import { Breadcrumb } from '@/components/home/breadcrumb';
import { Button } from '@/components/ui/button';
import { useInfiniteProductsData } from '@/hooks/api/use-infinite-products';
import { useStores } from '@/hooks/api/use-stores';
import { InfiniteScrollTrigger } from '@/components/ui/infinite-scroll-trigger';
import type { ProductFilterOptions, Gender } from '@/types/product';
import type { StoreFilterOptions } from '@/types/store';

function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [productFilters, setProductFilters] = useState<ProductFilterOptions>({});
  const [storeFilters, setStoreFilters] = useState<StoreFilterOptions>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'stores' | 'products'>('stores');

  // Get gender from URL query params
  const selectedGender = searchParams.get('gender') as Gender | null;

  // Build category filter based on selected gender (only for products view)
  const genderCategory = useMemo(() => {
    if (viewMode !== 'products') return undefined;
    if (productFilters.category) return productFilters.category;
    if (selectedGender) return selectedGender;
    return undefined;
  }, [selectedGender, productFilters.category, viewMode]);

  // Combine search query with filters
  const combinedProductFilters: ProductFilterOptions = {
    ...productFilters,
    category: genderCategory,
    ...(searchQuery && { search: searchQuery }),
  };

  const combinedStoreFilters: StoreFilterOptions = {
    ...storeFilters,
    ...(searchQuery && { search: searchQuery }),
  };

  // Determine what to show in products view
  const showGenderSelection = viewMode === 'products' && !selectedGender && !searchQuery;
  const showProductsGrid = Boolean(viewMode === 'products' && (selectedGender || searchQuery));

  // API calls - stores
  const {
    data: storesData,
    isLoading: storesLoading,
    error: storesError,
  } = useStores(viewMode === 'stores' ? combinedStoreFilters : undefined);

  // API calls - products (use infinite products for better performance)
  const {
    products: allProducts,
    totalProducts,
    isLoading: productsLoading,
    error: productsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProductsData({
    ...combinedProductFilters,
    enabled: showProductsGrid,
  });

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
  };

  const handleBackToSelection = () => {
    // Clear gender from URL
    router.push('/?view=products');
    setProductFilters({});
  };

  const handleViewModeChange = (mode: 'stores' | 'products') => {
    setViewMode(mode);
    if (mode === 'stores') {
      // Clear gender selection when switching to stores
      router.push('/');
    } else if (mode === 'products' && !selectedGender && !searchQuery) {
      // Navigate to products view without gender
      router.push('/?view=products');
    }
  };

  // Products are already processed by the infinite hook with shuffling logic
  const displayedProducts = allProducts;

  const isLoading = viewMode === 'products' ? productsLoading : storesLoading;
  const hasError = viewMode === 'products' ? productsError : storesError;

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Header onSearch={handleSearch} searchQuery={searchQuery} hideMobileSearch={showGenderSelection} />

      {/* Minimal Floating Toggle - ONLY for Gender Hero View */}
      {showGenderSelection && (
        <div className="fixed top-20 right-4 md:right-6 z-50">
          <div className="flex bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewModeChange('stores')}
              className="hover:bg-gray-100 text-xs md:text-sm px-3 md:px-4"
            >
              Tiendas
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-[#9EE493] text-[#20313A] hover:bg-[#8BD480] text-xs md:text-sm px-3 md:px-4"
            >
              Productos
            </Button>
          </div>
        </div>
      )}

      {/* Gender Selection Hero - Full screen when in products view with no gender selected */}
      {showGenderSelection && <GenderHeroSelection />}

      {/* Products View with Sidebar */}
      {showProductsGrid && (
        <div className="flex">
          {/* Sidebar - Only show when gender is selected (not for search) */}
          {selectedGender && (
            <CategorySidebar
              gender={selectedGender}
              selectedCategory={combinedProductFilters.category}
              onCategoryChange={handleCategoryChange}
            />
          )}

          {/* Main Content */}
          <main className={selectedGender ? 'flex-1 px-4 md:px-6 py-6' : 'container mx-auto px-4 py-6'}>
            {/* Back Button */}
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSelection}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a selección
              </Button>
            </div>

            {/* Breadcrumb */}
            <Breadcrumb category={combinedProductFilters.category} />

            {/* Header with Toggle */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-4">
                {/* Search Results Header */}
                {searchQuery ? (
                  <div>
                    <h2 className="text-xl font-bold text-[#20313A] font-helvetica">
                      Resultados para &quot;{searchQuery}&quot;
                    </h2>
                    <p className="text-gray-600 text-sm">{totalProducts || 0} productos encontrados</p>
                  </div>
                ) : selectedGender ? (
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#20313A] font-helvetica">
                      {selectedGender === 'hombre' && 'Hombre'}
                      {selectedGender === 'mujer' && 'Mujer'}
                      {selectedGender === 'ninos' && 'Niños'}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">{totalProducts || 0} productos disponibles</p>
                  </div>
                ) : null}

                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewModeChange('stores')}
                    className="hover:bg-gray-200"
                  >
                    Tiendas
                  </Button>
                  <Button variant="default" size="sm" className="bg-[#9EE493] text-[#20313A] hover:bg-[#8BD480]">
                    Productos
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-5">
              <Filters
                filters={combinedProductFilters}
                onFiltersChange={handleProductFiltersChange}
                isOpen={isFilterOpen}
                onToggle={() => setIsFilterOpen(!isFilterOpen)}
                type="products"
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
                <p className="text-gray-600 mb-4">Hubo un error al cargar los productos</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
                >
                  Reintentar
                </Button>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !hasError && displayedProducts.length > 0 && (
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

            {/* Empty State */}
            {!isLoading && !hasError && displayedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  {searchQuery ? `No se encontraron productos para "${searchQuery}"` : 'No hay productos disponibles'}
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
          </main>
        </div>
      )}

      {/* Stores View */}
      {viewMode === 'stores' && (
        <main className="container mx-auto px-4">
          {/* Tagline - Only when not searching */}
          {!searchQuery && (
            <div className="py-6 md:py-8">
              <div className="text-center mb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-[#20313A] font-helvetica mb-3">
                  Descubrí las mejores tiendas de ropa
                </h1>
                <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed font-satoshi">
                  Probá antes de comprar. Elegí tu tienda favorita, pedí lo que te gusta y pagá solo por lo que te quedás.
                </p>
              </div>
            </div>
          )}

          {/* Header with Title and Toggle */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-4">
              {searchQuery ? (
                <div>
                  <h2 className="text-xl font-bold text-[#20313A] font-helvetica">
                    Resultados para &quot;{searchQuery}&quot;
                  </h2>
                  <p className="text-gray-600 text-sm">{storesData?.results || 0} tiendas encontradas</p>
                </div>
              ) : (
                <h2 className="text-lg font-semibold text-[#20313A] font-helvetica">
                  Tiendas destacadas
                </h2>
              )}

              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button variant="default" size="sm" className="bg-[#9EE493] text-[#20313A] hover:bg-[#8BD480]">
                  Tiendas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewModeChange('products')}
                  className="hover:bg-gray-200"
                >
                  Productos
                </Button>
              </div>
            </div>
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
              <p className="text-gray-600 mb-4">Hubo un error al cargar las tiendas</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
              >
                Reintentar
              </Button>
            </div>
          )}

          {/* Stores Grid */}
          {!isLoading && !hasError && storesData?.data?.stores && storesData.data.stores.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
          {!isLoading && !hasError && storesData?.data?.stores.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                {searchQuery ? `No se encontraron tiendas para "${searchQuery}"` : 'No hay tiendas disponibles'}
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
        </main>
      )}

      {/* Bottom spacing */}
      <div className="pb-12" />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Cargando...</div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
