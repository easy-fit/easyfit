/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LocationModal } from '@/components/location/location-modal';
import { MapPin, User, Package, HelpCircle, LogOut, Home } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLogout } from '@/hooks/api/use-auth';
import { useRouter } from 'next/navigation';
import { useEasyFitToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onLocationSelect: (location: string) => void;
  userAddress?: {
    formatted: {
      street: string;
      streetNumber: string;
      apartment?: string;
      floor?: string;
      building?: string;
      city: string;
      province: string;
      postalCode: string;
    };
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
}

export function MobileSidebar({ isOpen, onClose, currentLocation, onLocationSelect, userAddress }: MobileSidebarProps) {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const router = useRouter();
  const toast = useEasyFitToast();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.logoutSuccess();
      onClose();
      router.push('/');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al cerrar sesión';
      toast.error(errorMessage);
    }
  };

  const handleLocationClick = () => {
    if (isAuthenticated) {
      setIsLocationModalOpen(true);
    } else {
      toast.info('Iniciá sesión para cambiar tu ubicación');
      router.push('/login');
      onClose();
    }
  };

  const handleLocationModalClose = () => {
    setIsLocationModalOpen(false);
  };

  const handleLocationUpdate = (location: string) => {
    onLocationSelect(location);
    setIsLocationModalOpen(false);
  };

  const menuItems = [
    {
      icon: Home,
      label: 'Inicio',
      href: '/',
      show: true,
    },
    {
      icon: Package,
      label: 'Mis Pedidos',
      href: '/orders',
      show: isAuthenticated,
    },
    {
      icon: User,
      label: 'Mi Perfil',
      href: '/profile',
      show: isAuthenticated,
    },
    {
      icon: HelpCircle,
      label: 'Ayuda',
      href: '/help',
      show: true,
    },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-sm p-0 gap-0 h-full max-h-screen w-full rounded-none border-0 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left">
          <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center p-4 border-b border-gray-100">
              <Link href="/" onClick={onClose}>
                <Image src="/main-logo.png" alt="EasyFit" width={100} height={32} className="h-8 w-auto" />
              </Link>
            </div>

            {/* User Section */}
            {isAuthenticated && user ? (
              <div className="p-4 bg-[#DBF7DC]/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#9EE493] rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-[#20313A]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#20313A]">{`${user.name} ${user.surname}`}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50">
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      router.push('/login');
                      onClose();
                    }}
                    className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      router.push('/register');
                      onClose();
                    }}
                    className="w-full border-[#2F4858] text-[#2F4858] hover:bg-[#DBF7DC] bg-transparent"
                  >
                    Registrarse
                  </Button>
                </div>
              </div>
            )}

            {/* Location Section */}
            <div className="p-4">
              <Button
                variant="ghost"
                onClick={handleLocationClick}
                className="w-full justify-start hover:bg-[#DBF7DC] text-left h-auto p-3"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <MapPin className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#20313A]">Tu ubicación</p>
                    <p className="text-xs text-gray-600 truncate">{currentLocation}</p>
                  </div>
                </div>
              </Button>
            </div>

            <Separator />

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto">
              <nav className="p-2">
                {menuItems
                  .filter((item) => item.show)
                  .map((item) => (
                    <Link key={item.href} href={item.href} onClick={onClose}>
                      <Button variant="ghost" className="w-full justify-start hover:bg-[#DBF7DC] text-[#20313A] h-12">
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
              </nav>
            </div>

            {/* Logout Button */}
            {isAuthenticated && (
              <>
                <Separator />
                <div className="p-4">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full justify-start text-red-600 hover:bg-red-50 h-12"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    {logoutMutation.isPending ? 'Cerrando...' : 'Cerrar Sesión'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Modal */}
      {isAuthenticated && (
        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={handleLocationModalClose}
          onLocationSelect={handleLocationUpdate}
          currentLocation={currentLocation}
          userAddress={userAddress}
        />
      )}
    </>
  );
}
