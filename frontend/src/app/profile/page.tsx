/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  Edit3,
  Save,
  X,
  Calendar,
  BadgeIcon as IdCard,
  Package,
  Heart,
} from 'lucide-react';
import { useEasyFitToast } from '@/hooks/use-toast';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useEasyFitToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    phone: user?.additionalInfo?.phone?.number || '',
    areaCode: user?.additionalInfo?.phone?.areaCode || '',
  });


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      // Here you would call an API to update user data
      toast.success('Perfil actualizado exitosamente', {
        description: 'Los cambios se guardaron correctamente',
      });
      setIsEditing(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al actualizar el perfil';
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setEditedData({
      name: user?.name || '',
      surname: user?.surname || '',
      phone: user?.additionalInfo?.phone?.number || '',
      areaCode: user?.additionalInfo?.phone?.areaCode || '',
    });
    setIsEditing(false);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F7F7F7]">
        <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#20313A] font-helvetica mb-2">Mi Perfil</h1>
          <p className="text-gray-600 font-satoshi">Administrá tu información personal y configuraciones</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[#20313A] font-satoshi">Información Personal</CardTitle>
                  <CardDescription>Tu información básica y datos de contacto</CardDescription>
                </div>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="border-[#2F4858] text-[#2F4858] hover:bg-[#DBF7DC]"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="border-gray-300 bg-transparent"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSave} className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name and Surname */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#20313A] font-medium">Nombre</Label>
                    {isEditing ? (
                      <Input
                        value={editedData.name}
                        onChange={(e) => setEditedData((prev) => ({ ...prev, name: e.target.value }))}
                        className="border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-[#20313A]">{user?.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#20313A] font-medium">Apellido</Label>
                    {isEditing ? (
                      <Input
                        value={editedData.surname}
                        onChange={(e) => setEditedData((prev) => ({ ...prev, surname: e.target.value }))}
                        className="border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-[#20313A]">{user?.surname}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-[#20313A] font-medium">Email</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-[#20313A]">{user?.email}</span>
                    {user?.emailVerification.verified ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 ml-auto">
                        Verificado
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="ml-auto">
                        No verificado
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="text-[#20313A] font-medium">Teléfono</Label>
                  {isEditing ? (
                    <div className="grid grid-cols-4 gap-2">
                      <Input
                        placeholder="Área"
                        value={editedData.areaCode}
                        onChange={(e) => setEditedData((prev) => ({ ...prev, areaCode: e.target.value }))}
                        className="border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                      />
                      <div className="col-span-3">
                        <Input
                          placeholder="Número"
                          value={editedData.phone}
                          onChange={(e) => setEditedData((prev) => ({ ...prev, phone: e.target.value }))}
                          className="border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-[#20313A]">
                        {user?.additionalInfo?.phone?.areaCode && user?.additionalInfo?.phone?.number
                          ? `(${user.additionalInfo.phone.areaCode}) ${user.additionalInfo.phone.number}`
                          : 'No configurado'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#20313A] font-medium">Documento</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <IdCard className="h-4 w-4 text-gray-400" />
                      <span className="text-[#20313A]">
                        {user?.additionalInfo?.dniType} {user?.additionalInfo?.dni}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#20313A] font-medium">Fecha de Nacimiento</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-[#20313A]">
                        {user?.additionalInfo?.birthDate
                          ? new Date(user.additionalInfo.birthDate).toLocaleDateString('es-AR')
                          : 'No configurado'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#20313A] font-satoshi flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificaciones
                </CardTitle>
                <CardDescription>Configurá cómo querés recibir notificaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#20313A]">Notificaciones por email</p>
                    <p className="text-sm text-gray-600">Recibí actualizaciones sobre tus pedidos</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#20313A]">Ofertas y promociones</p>
                    <p className="text-sm text-gray-600">Enterate de descuentos y ofertas especiales</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#20313A]">Recordatorios de prueba</p>
                    <p className="text-sm text-gray-600">Te recordamos devolver productos no deseados</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#20313A] font-satoshi">Estado de la Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tipo de cuenta</span>
                  <Badge variant="secondary" className="bg-[#DBF7DC] text-[#20313A]">
                    {user?.role === 'customer' ? 'Cliente' : user?.role === 'merchant' ? 'Vendedor' : 'admin'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email verificado</span>
                  {user?.emailVerification.verified ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ✓ Verificado
                    </Badge>
                  ) : (
                    <Badge variant="destructive">✗ Pendiente</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Miembro desde</span>
                  <span className="text-sm text-[#20313A]">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('es-AR', {
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Reciente'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
