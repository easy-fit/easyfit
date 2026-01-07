'use client';

import type React from 'react';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Store, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegisterCustomer } from '@/hooks/api/use-auth';
import { useEasyFitToast } from '@/hooks/use-toast';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthContext } from '@/providers/auth-provider';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const registerMutation = useRegisterCustomer();
  const toast = useEasyFitToast();
  const { loginWithGoogle } = useAuthContext();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleCustomGoogleClick = () => {
    const googleButton = googleButtonRef.current?.querySelector('div[role="button"]') as HTMLElement;
    if (googleButton) {
      googleButton.click();
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      toast.error('Error al registrarse con Google');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success('¡Cuenta creada exitosamente!');
      router.push('/');
    } catch (error: any) {
      toast.smartError(error, 'Error al registrarse con Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.validationError('contraseñas', 'Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const registerData = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        password: formData.password,
      };

      await registerMutation.mutateAsync(registerData);
      toast.success('¡Cuenta creada exitosamente!', {
        description: 'Revisa tu email para verificar tu cuenta'
      });
      router.push('/verify-email');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.smartError(error, 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="absolute top-4 left-4 hover:bg-[#DBF7DC] text-[#20313A]"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#20313A] font-helvetica">Únete a EasyFit</h1>
          <p className="text-gray-600 font-satoshi">Creá tu cuenta y empezá a probar ropa en casa</p>
        </div>

        {/* Registration Form */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-[#20313A] font-satoshi">Crear Cuenta</CardTitle>
            <CardDescription className="text-gray-600">Completá tus datos para registrarte</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Custom Google Sign Up Button */}
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
              Registrarse con Google
            </Button>

            {/* Hidden Google Login */}
            <div ref={googleButtonRef} className="hidden">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Error al registrarse con Google')}
              />
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">o registrate con email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name and Surname */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#20313A] font-medium">
                    Nombre
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Juan"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname" className="text-[#20313A] font-medium">
                    Apellido
                  </Label>
                  <Input
                    id="surname"
                    type="text"
                    placeholder="Pérez"
                    value={formData.surname}
                    onChange={(e) => handleInputChange('surname', e.target.value)}
                    className="border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                    required
                  />
                </div>
              </div>

              {/* Email */}
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
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                    required
                  />
                </div>
              </div>

              {/* Password */}
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
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#20313A] font-medium">
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirma tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10 pr-10 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-semibold py-2.5 mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                ¿Ya tenés cuenta?{' '}
                <Link href="/login" className="text-[#2F4858] hover:text-[#20313A] font-semibold">
                  Iniciá sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Merchant Option */}
        <div className="mt-6">
          <Card className="border-gray-200 bg-white/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#DBF7DC] p-2 rounded-full">
                  <Store className="h-5 w-5 text-[#20313A]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#20313A] text-sm">¿Tenés una tienda?</h3>
                  <p className="text-xs text-gray-600">Registrate como vendedor y vendé en EasyFit</p>
                </div>
                <Link href="/register/stores">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#2F4858] text-[#2F4858] hover:bg-[#DBF7DC] bg-transparent"
                  >
                    Registrarme
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
