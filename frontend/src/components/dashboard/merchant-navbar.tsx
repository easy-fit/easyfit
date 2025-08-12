'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { HelpCircle, LogOut, UserCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuth } from '@/hooks/use-auth';
import { useLogout } from '@/hooks/api/use-auth';
import { useEasyFitToast } from '@/hooks/use-toast';

function getInitials(name?: string, surname?: string) {
  const n = (name || '').trim();
  const s = (surname || '').trim();
  const ni = n ? n[0] : '';
  const si = s ? s[0] : '';
  return (ni + si || 'EF').toUpperCase();
}

export function MerchantNavbar() {
  const router = useRouter();
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const toast = useEasyFitToast();

  const merchantName = user ? `${user.name} ${user.surname}` : 'Merchant';
  const merchantEmail = user?.email ?? 'merchant@example.com';

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.logoutSuccess();
      router.push('/');
    } catch (error: unknown) {
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo + Dashboard title */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/main-logo.png" alt="EasyFit" width={100} height={32} className="h-8 w-auto" />
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1
              className="text-3xl leading-none transform -translate-y-[1px]"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: 900 }}
            >
              Tiendas
            </h1>
          </div>

          {/* Right side - User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt={merchantName} />
                  <AvatarFallback>{getInitials(user?.name, user?.surname)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{merchantName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{merchantEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Mi Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/support')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Soporte</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600" disabled={logoutMutation.isPending}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{logoutMutation.isPending ? 'Cerrando...' : 'Cerrar Sesión'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
