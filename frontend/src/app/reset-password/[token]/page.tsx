'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useResetPassword } from '@/hooks/api/use-auth';
import { useEasyFitToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const resetPasswordMutation = useResetPassword();
  const toast = useEasyFitToast();
  const { refreshUser } = useAuth();

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      setIsCheckingToken(true);

      if (!token) {
        setIsValidToken(false);
        setIsCheckingToken(false);
        return;
      }

      // For now, assume token is valid if it exists
      // In a real app, you might want to validate the token format or make an API call
      setIsValidToken(true);
      setIsCheckingToken(false);
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      const response = await resetPasswordMutation.mutateAsync({ code: token, password });
      
      // Refresh user data to get the updated user info
      await refreshUser();
      
      toast.success('¡Contraseña actualizada exitosamente!');
      
      // Get the user role from the response or refresh the user context
      const userRole = response?.data?.user?.role;
      
      // Redirect based on user role
      if (userRole === 'merchant' || userRole === 'manager') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
      
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al actualizar la contraseña';
      toast.error(errorMessage);

      // If the error indicates invalid token, update the state
      if (
        error?.response?.status === 400 ||
        error?.response?.data?.message?.includes('invalid') ||
        error?.response?.data?.message?.includes('expired')
      ) {
        setIsValidToken(false);
      }
    }
  };

  // Loading state while checking token
  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex justify-center items-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9EE493] mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex justify-center p-4 pt-16 relative">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 mt-8">
            <Image src="/main-logo.png" alt="EasyFit" width={180} height={60} className="mx-auto mb-6" />
          </div>

          {/* Invalid Token Card */}
          <Card className="border-gray-200 shadow-lg text-center">
            <CardContent className="p-8">
              <div className="flex justify-center mb-6">
                <div className="bg-red-100 p-4 rounded-full">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-[#20313A] mb-3 font-helvetica">Enlace inválido</h1>

              <p className="text-gray-600 mb-6 font-satoshi">
                Este enlace de recuperación ha expirado o no es válido. Por favor, solicitá un nuevo enlace.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/forgot-password')}
                  className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-semibold"
                >
                  Solicitar nuevo enlace
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="w-full border-[#2F4858] text-[#2F4858] hover:bg-[#DBF7DC]"
                >
                  Volver al inicio de sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }


  // Main reset password form
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex justify-center p-4 pt-16 relative">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push('/login')}
        className="absolute top-4 left-4 hover:bg-[#DBF7DC] text-[#20313A]"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 mt-8">
          <Image src="/main-logo.png" alt="EasyFit" width={180} height={60} className="mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-[#20313A] font-helvetica">Nueva contraseña</h1>
          <p className="text-gray-600 font-satoshi">Creá una contraseña segura para tu cuenta</p>
        </div>

        {/* Reset Password Form */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-[#20313A] font-satoshi">Restablecer Contraseña</CardTitle>
            <CardDescription className="text-gray-600">
              Ingresá tu nueva contraseña. Debe tener al menos 8 caracteres.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#20313A] font-medium">
                  Nueva contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tu nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                    required
                    minLength={8}
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

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#20313A] font-medium">
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirma tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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

              {/* Password Requirements */}
              <div className="bg-[#DBF7DC] p-3 rounded-lg">
                <p className="text-xs text-[#20313A]">
                  <strong>Requisitos de contraseña:</strong>
                </p>
                <ul className="text-xs text-[#20313A] mt-1 space-y-1">
                  <li className={password.length >= 8 ? 'text-green-600' : ''}>
                    • Al menos 8 caracteres {password.length >= 8 && '✓'}
                  </li>
                  <li className={password !== confirmPassword || !confirmPassword ? '' : 'text-green-600'}>
                    • Las contraseñas deben coincidir {password === confirmPassword && confirmPassword && '✓'}
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-semibold py-2.5"
                disabled={resetPasswordMutation.isPending || password.length < 8 || password !== confirmPassword}
              >
                {resetPasswordMutation.isPending ? 'Actualizando...' : 'Actualizar contraseña'}
              </Button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                ¿Recordaste tu contraseña?{' '}
                <Link href="/login" className="text-[#2F4858] hover:text-[#20313A] font-semibold">
                  Iniciá sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
