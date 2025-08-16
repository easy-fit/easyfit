import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { StoreSidebar } from '@/components/dashboard/store-sidebar';

interface PageStateProps {
  storeName?: string;
  logoUrl?: string;
  storeId: string;
  message: string;
}

export function LoadingState({ storeName, logoUrl, storeId, message }: PageStateProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <StoreSidebar storeName={storeName} logoUrl={logoUrl} active="products" baseHref={`/dashboard/${storeId}`} />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#9EE493] mx-auto mb-4" />
              <p className="text-gray-600">{message}</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

interface ErrorStateProps extends PageStateProps {
  onGoBack: () => void;
}

export function ErrorState({ storeName, logoUrl, storeId, message, onGoBack }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <StoreSidebar storeName={storeName} logoUrl={logoUrl} active="products" baseHref={`/dashboard/${storeId}`} />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-red-600 mb-4">{message}</p>
              <Button onClick={onGoBack}>Volver a Productos</Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}