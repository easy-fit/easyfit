// Price formatting utility
export const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined || isNaN(price)) {
    return '$0';
  }
  return `$${price.toLocaleString('es-AR')}`;
};

// Date formatting utility
export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

// Time formatting utility for countdowns
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Time frame formatting utility
export const formatTimeFrame = (date: Date): string => {
  return date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};