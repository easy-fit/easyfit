'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Phone, Store, ChevronDown, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRegisterCustomer } from '@/hooks/api/use-auth';
import { useEasyFitToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    dni: '',
    dniType: 'DNI' as 'DNI' | 'CI' | 'LC' | 'LE',
    birthDate: '',
    phone: '',
    areaCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const registerMutation = useRegisterCustomer();
  const toast = useEasyFitToast();

  // Check if basic fields are completed to show additional fields
  useEffect(() => {
    const basicFieldsCompleted =
      formData.name.trim() !== '' &&
      formData.surname.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.confirmPassword.trim() !== '';

    if (basicFieldsCompleted && !showAdditionalFields) {
      setShowAdditionalFields(true);
    }
  }, [
    formData.name,
    formData.surname,
    formData.email,
    formData.password,
    formData.confirmPassword,
    showAdditionalFields,
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    // Validate required additional fields
    if (!formData.dni.trim()) {
      toast.validationError('número de documento');
      return;
    }

    if (!formData.birthDate) {
      toast.validationError('fecha de nacimiento');
      return;
    }

    if (!formData.areaCode.trim() || !formData.phone.trim()) {
      toast.validationError('teléfono');
      return;
    }

    setIsLoading(true);

    try {
      const registerData = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        password: formData.password,
        additionalInfo: {
          dni: formData.dni,
          dniType: formData.dniType,
          birthDate: new Date(formData.birthDate),
          phone: {
            areaCode: formData.areaCode,
            number: formData.phone,
          },
        },
      };

      await registerMutation.mutateAsync(registerData);
      toast.success('¡Cuenta creada exitosamente!', {
        description: 'Revisa tu email para verificar tu cuenta'
      });
      router.push('/verify-email');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.message || 'Error al crear la cuenta');
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

              {/* Additional Fields - Show when basic fields are completed */}
              {showAdditionalFields && (
                <div className="pt-4 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 text-[#20313A]">
                    <ChevronDown className="h-4 w-4" />
                    <p className="text-sm font-medium">Datos adicionales</p>
                  </div>

                  {/* DNI */}
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={formData.dniType} onValueChange={(value) => handleInputChange('dniType', value)}>
                      <SelectTrigger className="border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DNI">DNI</SelectItem>
                        <SelectItem value="CI">CI</SelectItem>
                        <SelectItem value="LC">LC</SelectItem>
                        <SelectItem value="LE">LE</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="col-span-2">
                      <Input
                        placeholder="Número de documento"
                        value={formData.dni}
                        onChange={(e) => handleInputChange('dni', e.target.value)}
                        className="border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                        required
                      />
                    </div>
                  </div>

                  {/* Birth Date */}
                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-[#20313A] font-medium text-sm">
                      Fecha de nacimiento
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label className="text-[#20313A] font-medium text-sm">Teléfono</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Área"
                        value={formData.areaCode}
                        onChange={(e) => handleInputChange('areaCode', e.target.value)}
                        className="border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                        required
                      />
                      <div className="col-span-2 relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Número de teléfono"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="pl-10 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-semibold py-2.5 mt-6"
                disabled={isLoading || !showAdditionalFields}
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
