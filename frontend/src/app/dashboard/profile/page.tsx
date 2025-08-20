'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, MailCheck, User2, Loader2 } from 'lucide-react';

import { AuthGuard } from '@/components/auth/auth-guard';
import { MerchantNavbar } from '@/components/dashboard/merchant-navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { useAuth } from '@/hooks/use-auth';
import { useMe, useUpdateMe } from '@/hooks/api/use-users';
import { useEasyFitToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  surname: z.string().min(1, 'Requerido'),
  phoneArea: z.string().optional(),
  phoneNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function MerchantProfilePage() {
  const { user } = useAuth();
  const { data: me, isLoading: meLoading } = useMe();
  const updateMe = useUpdateMe();
  const toast = useEasyFitToast();

  const currentUser = me?.data?.user ?? user;

  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: currentUser?.name ?? '',
      surname: currentUser?.surname ?? '',
      phoneArea: currentUser?.additionalInfo?.phone?.areaCode ?? '',
      phoneNumber: currentUser?.additionalInfo?.phone?.number ?? '',
    },
  });

  useEffect(() => {
    if (!currentUser) return;
    form.reset({
      name: currentUser.name ?? '',
      surname: currentUser.surname ?? '',
      phoneArea: currentUser.additionalInfo?.phone?.areaCode ?? '',
      phoneNumber: currentUser.additionalInfo?.phone?.number ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?._id]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateMe.mutateAsync({
        name: values.name,
        surname: values.surname,
        additionalInfo: {
          phone: {
            areaCode: values.phoneArea || undefined,
            number: values.phoneNumber || undefined,
          },
        },
      });
      toast.success('Perfil actualizado', { description: 'Tus cambios se guardaron correctamente.' });
      setIsEditing(false);
    } catch (err: unknown) {
      toast.error('No se pudo actualizar el perfil');
    }
  };

  const handleCancel = () => {
    if (!currentUser) return;
    form.reset({
      name: currentUser.name ?? '',
      surname: currentUser.surname ?? '',
      phoneArea: currentUser.additionalInfo?.phone?.areaCode ?? '',
      phoneNumber: currentUser.additionalInfo?.phone?.number ?? '',
    });
    setIsEditing(false);
  };

  const kycStatus = currentUser?.merchantInfo?.kyc?.reviewResult;
  const isEmailVerified = currentUser?.emailVerification?.verified;

  const roleLabel = currentUser?.role === 'merchant' ? 'Vendedor' : currentUser?.role ?? '—';
  const kycLabel = kycStatus === 'verified' ? 'Verificado' : kycStatus ?? 'Pendiente';

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <MerchantNavbar />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Mi Perfil</h2>
            <p className="text-gray-600">Gestioná los datos de tu cuenta de comerciante.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Perfil */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>Información personal</CardTitle>
                  <CardDescription>Datos básicos de tu cuenta.</CardDescription>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="border-[#2F4858] text-[#2F4858] hover:bg-[#DBF7DC]"
                    >
                      Editar perfil
                    </Button>
                  ) : (
                    <>
                      <Button variant="ghost" onClick={handleCancel}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={updateMe.isPending}
                        className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
                      >
                        {updateMe.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          'Guardar cambios'
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {meLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-[#9EE493]" />
                  </div>
                ) : (
                  <Form {...form}>
                    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre</FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre" {...field} disabled={!isEditing} />
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
                              <FormLabel>Apellido</FormLabel>
                              <FormControl>
                                <Input placeholder="Apellido" {...field} disabled={!isEditing} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                          <Label>Email</Label>
                          <Input value={currentUser?.email ?? ''} disabled />
                          <p className="text-xs text-muted-foreground mt-1">El email no puede cambiarse aquí.</p>
                        </div>
                        <FormField
                          control={form.control}
                          name="phoneArea"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cod. área</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: 291" {...field} disabled={!isEditing} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teléfono</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: 1234567" {...field} disabled={!isEditing} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>

            {/* Estado de la cuenta */}
            <Card>
              <CardHeader>
                <CardTitle>Estado de la cuenta</CardTitle>
                <CardDescription>Verificación y permisos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User2 className="h-5 w-5 text-gray-600" />
                  <div className="text-sm">
                    <p className="font-medium text-[#20313A]">Rol</p>
                    <p className="text-gray-600">{roleLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MailCheck className={`h-5 w-5 ${isEmailVerified ? 'text-green-600' : 'text-gray-500'}`} />
                  <div className="text-sm">
                    <p className="font-medium text-[#20313A]">Email</p>
                    <p className={isEmailVerified ? 'text-green-700' : 'text-gray-600'}>
                      {isEmailVerified ? 'Verificado' : 'No verificado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className={`h-5 w-5 ${kycStatus === 'verified' ? 'text-green-600' : 'text-gray-500'}`} />
                  <div className="text-sm">
                    <p className="font-medium text-[#20313A]">KYC</p>
                    <p className={kycStatus === 'verified' ? 'text-green-700' : 'text-gray-600'}>{kycLabel}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
