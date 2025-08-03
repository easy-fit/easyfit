import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      expand={true}
      richColors={false}
      closeButton={true}
      toastOptions={{
        style: {
          fontFamily: 'var(--font-satoshi, system-ui, sans-serif)',
        },
        className: 'font-satoshi',
      }}
    />
  );
}
