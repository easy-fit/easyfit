'use client';

import type React from 'react';
import { buildQueryString } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Search, MapPin, User, ShoppingCart, Menu, X, LogOut, Package, HelpCircle, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LocationModal } from '@/components/location/location-modal';
import { useAuth } from '@/hooks/use-auth';
import { useLogout } from '@/hooks/api/use-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEasyFitToast } from '@/hooks/use-toast';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export function Header({ onSearch, searchQuery = '' }: HeaderProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Bahía Blanca, Centro');
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const logoutMutation = useLogout();
  const toast = useEasyFitToast();

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Update location when user data changes
  useEffect(() => {
    if (user?.address?.formatted) {
      const addr = user.address.formatted;
      const formattedAddress = `${addr.street} ${addr.streetNumber}, ${addr.city}`;
      setCurrentLocation(formattedAddress);
    } else if (user && !user.address) {
      // If user is logged in but has no address, set default
      setCurrentLocation('Bahía Blanca, Centro');
    } else if (!user) {
      // If user is logged out, reset to default
      setCurrentLocation('Bahía Blanca, Centro');
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      if (onSearch) {
        onSearch(localSearchQuery.trim());
      } else {
        // Navigate to search results or update current page filters
        const queryString = buildQueryString({ search: localSearchQuery.trim() });
        router.push(`/${queryString}`);
      }
    }
  };

  const handleSearchInputChange = (value: string) => {
    setLocalSearchQuery(value);

    // Trigger search callback for real-time filtering on home page
    if (onSearch && value.trim()) {
      onSearch(value.trim());
    } else if (onSearch && !value.trim()) {
      onSearch('');
    }
  };

  const clearSearch = () => {
    setLocalSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.logoutSuccess();
      router.push('/');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const handleLocationSelect = (location: string) => {
    setCurrentLocation(location);
    toast.locationUpdated();
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/main-logo.png" alt="EasyFit" width={100} height={32} className="h-8 w-auto" />
              </Link>
            </div>
            <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 relative">
            {/* Left side - Menu + Logo */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-[#DBF7DC]">
                <Menu className="h-5 w-5" />
              </Button>
              <Link href="/" className="flex items-center gap-2">
                <Image src="/main-logo.png" alt="EasyFit" width={100} height={32} className="h-8 w-auto" />
              </Link>
            </div>

            {/* Center - Search */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-lg px-4 hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Busca productos, marcas o categorías"
                  value={localSearchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                />
                {localSearchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-transparent"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </Button>
                )}
              </form>
            </div>

            {/* Right side - Location, User, Cart */}
            <div className="flex items-center gap-2 absolute right-4">
              {/* Location Button */}
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="hidden md:flex items-center gap-1 text-sm hover:bg-[#DBF7DC] max-w-48"
                >
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{currentLocation}</span>
                </Button>
              ) : (
                <div className="hidden md:flex items-center gap-1 text-sm text-gray-500 max-w-48 px-3 py-2">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">Bahía Blanca, Centro</span>
                </div>
              )}

              {/* User Dropdown */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative hover:bg-[#DBF7DC]">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{`${user.name} ${user.surname}`}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Mi Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Mis Pedidos</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/help')}>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Ayuda</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{logoutMutation.isPending ? 'Cerrando...' : 'Cerrar Sesión'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/login')}
                    className="hover:bg-[#DBF7DC]"
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => router.push('/register')}
                    className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
                  >
                    Registrarse
                  </Button>
                </div>
              )}

              <Button variant="ghost" size="icon" className="hover:bg-[#DBF7DC]">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="pb-4 md:hidden">
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Busca productos, marcas o categorías"
                value={localSearchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
              />
              {localSearchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-transparent"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </Button>
              )}
            </form>

            {/* Mobile Location Button */}
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLocationModalOpen(true)}
                className="w-full justify-start hover:bg-[#DBF7DC] text-[#20313A]"
              >
                <MapPin className="h-4 w-4 mr-2" />
                <span className="truncate">{currentLocation}</span>
              </Button>
            ) : (
              <div className="w-full flex items-center justify-start px-3 py-2 text-gray-500">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="truncate">Bahía Blanca, Centro</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Location Modal */}
      {isAuthenticated && (
        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          onLocationSelect={handleLocationSelect}
          currentLocation={currentLocation}
          userAddress={user?.address}
        />
      )}
    </>
  );
}
