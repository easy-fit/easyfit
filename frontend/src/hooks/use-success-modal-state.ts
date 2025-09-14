import { useCallback } from 'react';

export const useSuccessModalState = () => {
  // Helper function to check if success modal was already shown for this order
  const hasShownSuccessModal = useCallback((orderId: string): boolean => {
    try {
      const shownOrders = localStorage.getItem('easyfit-shown-success-modals');
      if (!shownOrders) return false;
      const parsedOrders = JSON.parse(shownOrders);
      return Array.isArray(parsedOrders) && parsedOrders.includes(orderId);
    } catch {
      return false;
    }
  }, []);

  // Helper function to mark success modal as shown for this order
  const markSuccessModalShown = useCallback((orderId: string) => {
    try {
      const shownOrders = localStorage.getItem('easyfit-shown-success-modals');
      let parsedOrders: string[] = [];

      if (shownOrders) {
        parsedOrders = JSON.parse(shownOrders) || [];
      }

      if (!parsedOrders.includes(orderId)) {
        parsedOrders.push(orderId);
        localStorage.setItem('easyfit-shown-success-modals', JSON.stringify(parsedOrders));
      }
    } catch (error) {
      console.warn('Failed to save success modal state to localStorage:', error);
    }
  }, []);

  return {
    hasShownSuccessModal,
    markSuccessModalShown,
  };
};