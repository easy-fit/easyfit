'use client';

import type React from 'react';
import { Suspense, useRef } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogin } from '@/hooks/api/use-auth';
import { useEasyFitToast } from '@/hooks/use-toast';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthContext } from '@/providers/auth-provider';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();
  const toast = useEasyFitToast();
  const { loginWithGoogle } = useAuthContext();

  const redirectTo = searchParams.get('redirect');

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      toast.error('Error al iniciar sesión con Google');
      return;
    }

    setIsLoading(true);
    try {
      const loggedInUser = await loginWithGoogle(credentialResponse.credential);
      toast.loginSuccess();

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        const defaultRedirect = getRoleBasedRedirect(loggedInUser.role);
        router.push(defaultRedirect);
      }
    } catch (error: any) {
      toast.authError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBasedRedirect = (userRole: string) => {
    switch (userRole) {
      case 'merchant':
        return '/dashboard';
      case 'admin':
        return '/';
      case 'manager':
        return '/dashboard';
      default:
        return '/';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loggedInUser = await loginMutation.mutateAsync({ email, password });
      toast.loginSuccess();

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        const defaultRedirect = getRoleBasedRedirect(loggedInUser.role);
        router.push(defaultRedirect);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.authError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomGoogleClick = () => {
    const googleButton = googleButtonRef.current?.querySelector('div[role="button"]') as HTMLElement;
    if (googleButton) {
      googleButton.click();
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex justify-center p-4 pt-16 relative">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => redirectTo ? router.push('/') : router.back()}
        className="absolute top-4 left-4 hover:bg-[#DBF7DC] text-[#20313A]"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 mt-8">
          <Image src="/main-logo.png" alt="EasyFit" width={180} height={60} className="mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-[#20313A] font-helvetica">Bienvenido de vuelta</h1>
          <p className="text-gray-600 font-satoshi">Ingresá a tu cuenta para continuar</p>
        </div>

        {/* Login Card */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-[#20313A] font-satoshi">Iniciar Sesión</CardTitle>
            <CardDescription className="text-gray-600">Elegí cómo querés ingresar</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Google Login - Primary */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-2 border-gray-300 hover:border-[#9EE493] hover:bg-[#F8FFF8] text-[#20313A] font-semibold mb-4 relative"
              onClick={handleCustomGoogleClick}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </Button>

            {/* Hidden Google Login */}
            <div ref={googleButtonRef} className="hidden">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Error al iniciar sesión con Google')}
              />
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">o con email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#20313A] font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#20313A] font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-[#2F4858] hover:text-[#20313A] font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-semibold py-2.5"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                ¿No tenés cuenta?{' '}
                <Link href="/register" className="text-[#2F4858] hover:text-[#20313A] font-semibold">
                  Registrate
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
