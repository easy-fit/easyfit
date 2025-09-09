'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForgotPassword } from '@/hooks/api/use-auth';
import { useEasyFitToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const router = useRouter();
  const forgotPasswordMutation = useForgotPassword();
  const toast = useEasyFitToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await forgotPasswordMutation.mutateAsync(email);
      setIsEmailSent(true);
      toast.success('¡Email enviado exitosamente!');
    } catch (error: any) {
      toast.smartError(error, 'Error al enviar el email');
    }
  };

  if (isEmailSent) {
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
          </div>

          {/* Success Card */}
          <Card className="border-gray-200 shadow-lg text-center">
            <CardContent className="p-8">
              <div className="flex justify-center mb-6">
                <div className="bg-[#9EE493] p-4 rounded-full">
                  <CheckCircle className="h-8 w-8 text-[#20313A]" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-[#20313A] mb-3 font-helvetica">
                ¡Email enviado, ya podes cerrar esta ventana!
              </h1>

              <p className="text-gray-600 mb-6 font-satoshi">
                Te enviamos un enlace para restablecer tu contraseña a <strong>{email}</strong>
              </p>

              <div className="bg-[#DBF7DC] p-4 rounded-lg mb-6">
                <p className="text-sm text-[#20313A]">
                  <strong>Consejo:</strong> Si no encontrás el email, revisá tu carpeta de spam o correo no deseado.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-semibold"
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

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex justify-center p-4 pt-16 relative">
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
        <div className="text-center mb-8 mt-8">
          <Image src="/main-logo.png" alt="EasyFit" width={180} height={60} className="mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-[#20313A] font-helvetica">¿Olvidaste tu contraseña?</h1>
          <p className="text-gray-600 font-satoshi">No te preocupes, te ayudamos a recuperarla</p>
        </div>

        {/* Forgot Password Form */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-[#20313A] font-satoshi">Recuperar Contraseña</CardTitle>
            <CardDescription className="text-gray-600">
              Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-semibold py-2.5"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending ? 'Enviando...' : 'Enviar enlace de recuperación'}
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

        {/* Additional Help */}
        <div className="mt-6">
          <Card className="border-gray-200 bg-white/50">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="font-semibold text-[#20313A] text-sm mb-2">¿Necesitás ayuda?</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Si tenés problemas para recuperar tu cuenta, podés contactarnos
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2F4858] text-[#2F4858] hover:bg-[#DBF7DC] bg-transparent"
                >
                  Contactar soporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
