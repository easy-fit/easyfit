/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import { useCreateManager } from '@/hooks/api/use-store-managers';
import { useEasyFitToast } from '@/hooks/use-toast';
import type { CreateManagerDTO } from '@/types/user';

// Form validation schema
const createManagerSchema = z
  .object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    surname: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    email: z.string().email('Ingresa un email válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
    dni: z.string().optional(),
    dniType: z.enum(['DNI', 'CI', 'LC', 'LE']).optional(),
    phone: z
      .object({
        areaCode: z.string().optional(),
        number: z.string().optional(),
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type CreateManagerFormValues = z.infer<typeof createManagerSchema>;

interface CreateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  storeName?: string;
}

export function CreateManagerModal({ isOpen, onClose, storeId, storeName }: CreateManagerModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toast = useEasyFitToast();
  const createManagerMutation = useCreateManager();

  const form = useForm<CreateManagerFormValues>({
    resolver: zodResolver(createManagerSchema),
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      password: '',
      confirmPassword: '',
      dni: '',
      dniType: 'DNI',
      phone: {
        areaCode: '',
        number: '',
      },
    },
  });

  const handleSubmit = async (data: CreateManagerFormValues) => {
    try {
      const managerData: CreateManagerDTO = {
        name: data.name,
        surname: data.surname,
        email: data.email,
        password: data.password,
        storeId,
        additionalInfo: {
          dni: data.dni || undefined,
          dniType: data.dniType,
          phone:
            data.phone?.areaCode && data.phone?.number
              ? {
                  areaCode: data.phone.areaCode,
                  number: data.phone.number,
                }
              : undefined,
        },
      };

      await createManagerMutation.mutateAsync(managerData);

      toast.success('Manager creado exitosamente', {
        description: `${data.name} ${data.surname} ha sido agregado al equipo`,
      });

      form.reset();
      onClose();
    } catch (error: any) {
      toast.error('Error al crear manager', {
        description: error?.message || 'Por favor, intenta nuevamente',
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#20313A]">
            <div className="p-2 bg-[#DBF7DC] rounded-lg">
              <UserPlus className="h-5 w-5 text-[#20313A]" />
            </div>
            Agregar Manager
          </DialogTitle>
          <DialogDescription>
            Crea una cuenta de manager para {storeName || 'tu tienda'}. El manager tendrá acceso completo a la gestión
            de la tienda.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Información Personal</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Juan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="manager@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Account Security */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Seguridad de Cuenta</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" {...field} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Contraseña *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Repite la contraseña"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Information (Optional) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Información Adicional (Opcional)
                </span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="dniType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Documento</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DNI">DNI</SelectItem>
                          <SelectItem value="CI">CI</SelectItem>
                          <SelectItem value="LC">LC</SelectItem>
                          <SelectItem value="LE">LE</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Documento</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="phone.areaCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Área</FormLabel>
                      <FormControl>
                        <Input placeholder="11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone.number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="my-6" />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleClose} disabled={createManagerMutation.isPending}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createManagerMutation.isPending}
                className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-medium"
              >
                {createManagerMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear Manager
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
