/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVerifyEmail, useResendVerificationCode } from '@/hooks/api/use-auth';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();
  const verifyEmailMutation = useVerifyEmail();
  const resendCodeMutation = useResendVerificationCode();

  // Auto-verify when all 6 digits are entered
  useEffect(() => {
    const verificationCode = code.join('');
    if (verificationCode.length === 6 && !isVerifying) {
      handleVerify(verificationCode);
    }
  }, [code, isVerifying]);

  const handleVerify = async (verificationCode: string) => {
    setIsVerifying(true);

    try {
      await verifyEmailMutation.mutateAsync(verificationCode);
      toast.success('¡Email verificado exitosamente!');
      router.push('/');
    } catch (error: any) {
      toast.error(error?.message || 'Código de verificación inválido');
      // Clear the code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...code];
    newCode[index] = value;

    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      await resendCodeMutation.mutateAsync();
      toast.success('Código reenviado exitosamente');
      setCode(['', '', '', '', '', '']); // Clear current code
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      toast.error(error?.message || 'Error al reenviar el código');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4 relative">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="absolute top-4 left-4 hover:bg-[#DBF7DC] text-[#20313A]"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="w-full max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="bg-[#9EE493] p-6 rounded-2xl">
            <Mail className="h-12 w-12 text-[#20313A]" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-[#20313A] font-helvetica">Ingresá el código</h1>
          <p className="text-gray-600 font-satoshi text-lg">Enviamos un código e instrucciones a tu email.</p>
        </div>

        {/* Code Input Fields */}
        <div className="flex justify-center gap-3">
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-14 h-14 text-center text-2xl font-mono border-2 border-gray-300 focus:border-[#9EE493] focus:ring-[#9EE493] rounded-lg"
              disabled={isVerifying}
            />
          ))}
        </div>

        {/* Loading state */}
        {isVerifying && <p className="text-[#2F4858] font-satoshi font-medium">Verificando código...</p>}

        {/* Expiration time */}
        <p className="text-gray-600 font-satoshi">Tu código vence en 15 minutos.</p>

        {/* Resend Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleResendCode}
            disabled={isResending}
            className="border-[#2F4858] text-[#2F4858] hover:bg-[#DBF7DC] bg-transparent py-3 px-8"
          >
            {isResending ? 'Reenviando...' : 'Reenviar'}
          </Button>
        </div>

        {/* Help tip */}
        <div className="bg-[#DBF7DC] p-4 rounded-lg mt-6">
          <p className="text-sm text-[#20313A]">
            <strong>Consejo:</strong> Si no encontrás el email, revisá tu carpeta de spam o correo no deseado.
          </p>
        </div>
      </div>
    </div>
  );
}
