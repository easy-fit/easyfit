/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar, Mail, Phone, Trash2, UserCheck } from 'lucide-react';
import { useRemoveManagerFromStore } from '@/hooks/api/use-store-managers';
import { useEasyFitToast } from '@/hooks/use-toast';
import type { StoreManagerAssignment } from '@/types/user';

interface ManagerCardProps {
  assignment: StoreManagerAssignment;
  storeId: string;
  onRemove?: () => void;
}

export function ManagerCard({ assignment, storeId, onRemove }: ManagerCardProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const toast = useEasyFitToast();
  const removeManagerMutation = useRemoveManagerFromStore();

  const manager = assignment.manager;
  const assignedByUser = assignment.assignedByUser;

  if (!manager) {
    return null;
  }

  const handleRemove = async () => {
    try {
      await removeManagerMutation.mutateAsync({
        storeId,
        managerId: manager._id,
      });

      toast.success('Manager removido', {
        description: `${manager.name} ${manager.surname} ha sido removido del equipo`,
      });

      onRemove?.();
      setShowRemoveDialog(false);
    } catch (error: any) {
      toast.error('Error al remover manager', {
        description: error?.message || 'Por favor, intenta nuevamente',
      });
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string, surname: string) => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      <Card className="transition-all hover:shadow-md border-0 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-[#9EE493]">
                <AvatarFallback className="bg-[#DBF7DC] text-[#20313A] font-semibold">
                  {getInitials(manager.name, manager.surname)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-[#20313A] text-lg">
                  {manager.name} {manager.surname}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-[#DBF7DC] text-[#20313A] border-[#9EE493] text-xs">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Manager
                  </Badge>
                  <Badge
                    variant={assignment.isActive ? 'default' : 'secondary'}
                    className={
                      assignment.isActive
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }
                  >
                    {assignment.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRemoveDialog(true)}
              disabled={removeManagerMutation.isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Contact Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{manager.email}</span>
            </div>

            {manager.additionalInfo?.phone?.areaCode && manager.additionalInfo?.phone?.number && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>
                  +54 {manager.additionalInfo.phone.areaCode} {manager.additionalInfo.phone.number}
                </span>
              </div>
            )}
          </div>

          {/* Assignment Information */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Agregado el {formatDate(assignment.assignedAt)}</span>
              </div>
            </div>

            {assignedByUser && (
              <div className="mt-1 text-xs text-gray-500">
                Por {assignedByUser.name} {assignedByUser.surname}
              </div>
            )}
          </div>

          {/* Additional Info */}
          {manager.additionalInfo?.dni && (
            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                {manager.additionalInfo.dniType || 'DNI'}: {manager.additionalInfo.dni}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Remover manager del equipo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción removerá a{' '}
              <strong>
                {manager.name} {manager.surname}
              </strong>{' '}
              del equipo de tu tienda. El usuario ya no podrá acceder al panel de gestión de esta tienda.
              <br />
              <br />
              Esta acción se puede revertir volviendo a agregar al manager más tarde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeManagerMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={removeManagerMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {removeManagerMutation.isPending ? 'Removiendo...' : 'Remover Manager'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
