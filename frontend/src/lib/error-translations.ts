/**
 * Comprehensive English-to-Spanish error message translation system
 * Based on actual backend error messages from EasyFit API
 */

// Main translation mapping for exact error message matches
export const ERROR_TRANSLATIONS: Record<string, string> = {
  // ==========================================
  // AUTHENTICATION & AUTHORIZATION (24 messages)
  // ==========================================
  "Invalid email or password": "Email o contraseña inválidos",
  "Invalid token, login to get access": "Token inválido, iniciá sesión para acceder",
  "Your token expired, login to get access": "Tu sesión expiró, iniciá sesión nuevamente",
  "No refresh token found": "No se encontró token de actualización",
  "Invalid refresh token": "Token de actualización inválido",
  "Current password is incorrect": "La contraseña actual es incorrecta",
  "You do not have permission to create managers for this store": "No tenés permisos para crear managers en esta tienda",
  "You do not have permission to assign managers to this store": "No tenés permisos para asignar managers a esta tienda",
  "Rider not assigned to this order or delivery completed": "El rider no está asignado a este pedido o la entrega ya finalizó",
  "Invalid webhook signature": "Firma de webhook inválida",
  "User with this email or phone already exists": "Ya existe un usuario con este email o teléfono",
  "Email already verified": "El email ya está verificado",
  "Invalid or expired verification code": "Código de verificación inválido o expirado",
  "Token is invalid or has expired": "El token es inválido o ha expirado",
  "Too many failed attempts. Please request a new code.": "Demasiados intentos fallidos. Solicitá un nuevo código.",
  "Authentication required": "Autenticación requerida",
  "Access denied": "Acceso denegado",
  "Insufficient permissions": "Permisos insuficientes",
  "Session expired": "Sesión expirada",
  "Account locked": "Cuenta bloqueada",
  "Invalid credentials": "Credenciales inválidas",
  "Authorization header missing": "Falta el header de autorización",
  "Bearer token required": "Token Bearer requerido",
  "Invalid token format": "Formato de token inválido",

  // ==========================================
  // VALIDATION ERRORS (15 messages)
  // ==========================================
  "Email and verification code are required": "Email y código de verificación son requeridos",
  "Current and new password are required": "Contraseña actual y nueva son requeridas",
  "Password is required": "La contraseña es requerida",
  "Email is required": "El email es requerido",
  "Invalid delivery address": "Dirección de entrega inválida",
  "User address is required for checkout": "Necesitás configurar tu dirección para continuar con la compra",
  "Invalid document type": "Tipo de documento inválido",
  "Invalid store ID format": "Formato de ID de tienda inválido",
  "Invalid manager ID format": "Formato de ID de manager inválido",
  "Invalid ID format": "Formato de ID inválido",
  "Invalid store ID": "ID de tienda inválido",
  "Store billing information not found": "Información de facturación de la tienda no encontrada",
  "Invalid data format": "Formato de datos inválido",
  "Required field missing": "Campo requerido faltante",
  "Invalid phone number format": "Formato de número de teléfono inválido",
  "Invalid date format": "Formato de fecha inválido",

  // ==========================================
  // BUSINESS LOGIC ERRORS (35 messages)
  // ==========================================
  "Order must be delivered to start try period": "El pedido debe ser entregado para iniciar el período de prueba",
  "Try period not available for this shipping type": "Período de prueba no disponible para este tipo de envío",
  "No try period found for this order": "No se encontró período de prueba para este pedido",
  "Store with this name already exists": "Ya existe una tienda con este nombre",
  "Product with this title already exists in the store": "Ya existe un producto con este título en la tienda",
  "Location for this rider already exists": "Ya existe una ubicación para este rider",
  "Manager is already assigned to this store": "El manager ya está asignado a esta tienda",
  "Not enough stock available": "Stock insuficiente disponible",
  "Product variant not available": "Variante del producto no disponible",
  "Out of stock": "Sin stock",
  "Insufficient stock": "Stock insuficiente",
  "Stock not available": "Stock no disponible",
  "Product out of stock": "Producto sin stock",
  "Inventory insufficient": "Inventario insuficiente",
  "Store is not accepting orders": "La tienda no está aceptando pedidos",
  "Store billing not approved": "Facturación de la tienda no aprobada",
  "Minimum order amount not met": "Monto mínimo de pedido no alcanzado",
  "Delivery area not covered": "Área de entrega no cubierta",
  "Payment processing failed": "Error en el procesamiento del pago",
  "Insufficient funds": "Fondos insuficientes",
  "Card declined": "Tarjeta rechazada",
  "Transaction already processed": "Transacción ya procesada",
  "Refund not allowed": "Reembolso no permitido",
  "Order cannot be cancelled": "El pedido no puede ser cancelado",
  "Order already completed": "Pedido ya completado",
  "Return period expired": "Período de devolución expirado",
  "Item not eligible for return": "Artículo no elegible para devolución",
  "Damaged item cannot be processed": "Artículo dañado no puede ser procesado",
  "Inspection required": "Inspección requerida",
  "Quality check failed": "Control de calidad falló",
  "Inventory count mismatch": "Discrepancia en el conteo de inventario",
  "Product discontinued": "Producto discontinuado",
  "Seasonal restriction applies": "Aplica restricción estacional",
  "Age verification required": "Verificación de edad requerida",
  "Geographic restriction applies": "Aplica restricción geográfica",
  "Service temporarily unavailable": "Servicio temporalmente no disponible",
  "Maintenance mode active": "Modo de mantenimiento activo",
  "Rate limit exceeded": "Límite de velocidad excedido",
  "Quota exceeded": "Cuota excedida",
  "Feature not available": "Función no disponible",
  "Store cannot be deleted as it contains products. Please delete the products first.": "No se puede eliminar la tienda porque contiene productos. Eliminá los productos primero.",
  "Product cannot be deleted as it contains variants. Please delete the variants first.": "No se puede eliminar el producto porque tiene variantes. Eliminá las variantes primero o usá la opción de eliminación forzada.",
  "Cannot delete product with variants": "No se puede eliminar el producto con variantes",
  "Product has variants and cannot be deleted": "El producto tiene variantes y no puede ser eliminado",

  // ==========================================
  // RESOURCE NOT FOUND (20 messages)
  // ==========================================
  "Store not found": "Tienda no encontrada",
  "User not found": "Usuario no encontrado",
  "Product not found": "Producto no encontrado",
  "Order not found": "Pedido no encontrado",
  "Customer not found": "Cliente no encontrado",
  "Payment not found": "Pago no encontrado",
  "Tax document not found": "Documento fiscal no encontrado",
  "Rider assignment not found": "Asignación de rider no encontrada",
  "Manager assignment not found": "Asignación de manager no encontrada",
  "Location not found for this rider": "Ubicación no encontrada para este rider",
  "Rider location not found": "Ubicación del rider no encontrada",
  "No available riders found nearby": "No se encontraron riders disponibles cerca",
  "Product variant not found": "Variante del producto no encontrada",
  "Category not found": "Categoría no encontrada",
  "Address not found": "Dirección no encontrada",
  "Cart not found": "Carrito no encontrado",
  "Session not found": "Sesión no encontrada",
  "File not found": "Archivo no encontrado",
  "Image not found": "Imagen no encontrada",
  "Document not found": "Documento no encontrado",

  // ==========================================
  // FILE UPLOAD & PROCESSING (12 messages)
  // ==========================================
  "Only PDF, JPG, and PNG files are allowed": "Solo se permiten archivos PDF, JPG y PNG",
  "Failed to generate upload URL": "Error al generar URL de carga",
  "Failed to update store": "Error al actualizar la tienda",
  "Failed to update document metadata": "Error al actualizar metadatos del documento",
  "Failed to update document status": "Error al actualizar estado del documento",
  "File too large": "Archivo demasiado grande",
  "Invalid file format": "Formato de archivo inválido",
  "Upload failed": "Error en la carga",
  "File corrupted": "Archivo corrupto",
  "Storage limit exceeded": "Límite de almacenamiento excedido",
  "Invalid image dimensions": "Dimensiones de imagen inválidas",
  "Processing failed": "Error en el procesamiento",

  // ==========================================
  // PAYMENT & EXTERNAL SERVICE ERRORS (30+ messages)
  // ==========================================
  "MercadoPago payment creation failed": "Error al crear pago en MercadoPago",
  "MercadoPago payment processing failed": "Error al procesar pago en MercadoPago",
  "MercadoPago payment retrieval failed": "Error al obtener pago de MercadoPago",
  "MercadoPago payment capture failed": "Error al capturar pago en MercadoPago",
  "MercadoPago payment cancellation failed": "Error al cancelar pago en MercadoPago",
  "MercadoPago payment refund failed": "Error al reembolsar pago en MercadoPago",
  "Failed to create Sumsub applicant. Please try again later.": "Error al crear aplicante en Sumsub. Intentá más tarde.",
  "Failed to generate Web SDK link. Please try again later.": "Error al generar enlace Web SDK. Intentá más tarde.",
  "External service unavailable": "Servicio externo no disponible",
  "API rate limit exceeded": "Límite de API excedido",

  // ==========================================
  // MERCADOPAGO STATUS DETAIL CODES
  // ==========================================
  
  // Card rejection codes
  "cc_rejected_other_reason": "Pago rechazado por tu banco. Intentá con otra tarjeta o contactá a tu banco.",
  "cc_rejected_insufficient_amount": "Fondos insuficientes. Verificá el saldo de tu tarjeta.",
  "cc_rejected_bad_filled_security_code": "Código de seguridad incorrecto. Verificá el CVV de tu tarjeta.",
  "cc_rejected_bad_filled_date": "Fecha de vencimiento incorrecta. Verificá los datos de tu tarjeta.",
  "cc_rejected_bad_filled_other": "Datos de tarjeta incorrectos. Verificá la información ingresada.",
  "cc_rejected_duplicated_payment": "Ya existe un pago con estos datos. Esperá unos minutos antes de intentar nuevamente.",
  "cc_rejected_high_risk": "Pago rechazado por seguridad. Intentá con otra tarjeta o método de pago.",
  "cc_rejected_max_attempts": "Has superado el límite de intentos. Intentá más tarde o con otra tarjeta.",
  "cc_rejected_call_for_authorize": "Tu banco requiere autorización. Contactá a tu banco para autorizar el pago.",
  "cc_rejected_card_disabled": "Tu tarjeta está deshabilitada. Contactá a tu banco.",
  "cc_rejected_invalid_installments": "Número de cuotas no válido para esta tarjeta.",
  "cc_rejected_blacklist": "Pago no autorizado. Contactá a tu banco.",
  
  // General payment status codes
  "rejected": "Pago rechazado. Verificá los datos o intentá con otro método de pago.",
  "cancelled": "Pago cancelado.",
  "pending": "Pago pendiente de aprobación.",
  "in_process": "Pago en proceso. Te notificaremos cuando se confirme.",
  "authorized": "Pago autorizado exitosamente.",
  "approved": "Pago aprobado exitosamente.",
  
  // Payment method specific
  "pending_waiting_payment": "Esperando el pago. Seguí las instrucciones recibidas.",
  "pending_waiting_transfer": "Esperando la transferencia bancaria.",
  "pending_review_manual": "Pago en revisión manual. Te notificaremos cuando se resuelva.",
  "rejected_by_bank": "Pago rechazado por el banco. Intentá con otra tarjeta.",
  "rejected_by_regulations": "Pago rechazado por regulaciones. Contactá al soporte.",

  // ==========================================
  // SUCCESS MESSAGES (8 messages)
  // ==========================================
  "Logged out successfully": "Sesión cerrada exitosamente",
  "Email verified successfully": "Email verificado exitosamente",
  "Verification code sent successfully": "Código de verificación enviado exitosamente",
  "Manager created successfully": "Manager creado exitosamente",
  "If an account exists, a password reset email has been sent": "Si existe una cuenta, se envió un email para restablecer la contraseña",
  "Payment processed successfully": "Pago procesado exitosamente",
  "Delivery completed successfully! You are now available for new orders.": "¡Entrega completada exitosamente! Ya estás disponible para nuevos pedidos.",
  "Operation completed successfully": "Operación completada exitosamente",

  // ==========================================
  // SYSTEM ERRORS (10 messages)
  // ==========================================
  "Something went wrong!": "¡Algo salió mal!",
  "Error retrieving store order analytics": "Error al obtener análisis de pedidos de la tienda",
  "Error retrieving store orders": "Error al obtener pedidos de la tienda",
  "Error retrieving store product metrics": "Error al obtener métricas de productos de la tienda",
  "Error retrieving store products": "Error al obtener productos de la tienda",
  "Error retrieving merchant dashboard data": "Error al obtener datos del dashboard del comerciante",
  "Database connection error": "Error de conexión a la base de datos",
  "Server error": "Error del servidor",
  "Internal server error": "Error interno del servidor",
  "Service unavailable": "Servicio no disponible",
};

// Field name translations for dynamic error messages
export const FIELD_TRANSLATIONS: Record<string, string> = {
  "email": "email",
  "password": "contraseña",
  "name": "nombre",
  "surname": "apellido",
  "phone": "teléfono",
  "address": "dirección",
  "store": "tienda",
  "product": "producto",
  "order": "pedido",
  "payment": "pago",
  "quantity": "cantidad",
  "price": "precio",
  "description": "descripción",
  "category": "categoría",
  "image": "imagen",
  "document": "documento",
  "date": "fecha",
  "time": "hora",
  "location": "ubicación",
  "status": "estado",
  "type": "tipo",
  "size": "tamaño",
  "color": "color",
  "variant": "variante",
  "stock": "stock",
  "title": "título",
  "username": "nombre de usuario",
  "role": "rol",
  "permissions": "permisos",
  "billing": "facturación",
  "shipping": "envío",
  "delivery": "entrega",
  "rider": "rider",
  "manager": "manager",
  "customer": "cliente",
  "merchant": "comerciante",
};

/**
 * Translates field names from English to Spanish
 */
export function translateField(englishField: string): string {
  const lowerField = englishField.toLowerCase();
  return FIELD_TRANSLATIONS[lowerField] || englishField;
}

/**
 * Main translation function that handles exact matches and pattern matching
 */
export function translateError(englishMessage: string): string {
  // Exact match first - most common case
  if (ERROR_TRANSLATIONS[englishMessage]) {
    return ERROR_TRANSLATIONS[englishMessage];
  }

  // Pattern matching for dynamic messages
  
  // Handle "Invalid {field}: {value}." patterns
  const invalidFieldMatch = englishMessage.match(/^Invalid (.+): (.+)\.?$/i);
  if (invalidFieldMatch) {
    const field = translateField(invalidFieldMatch[1]);
    return `${field} inválido: ${invalidFieldMatch[2]}`;
  }

  // Handle "Duplicated value: {value}. Use another one!" patterns
  const duplicateMatch = englishMessage.match(/^Duplicated value: (.+)\. Use another one!$/i);
  if (duplicateMatch) {
    return `Valor duplicado: ${duplicateMatch[1]}. Usá otro valor.`;
  }

  // Handle "{field} is required" patterns
  const requiredFieldMatch = englishMessage.match(/^(.+) is required\.?$/i);
  if (requiredFieldMatch) {
    const field = translateField(requiredFieldMatch[1]);
    return `${field} es requerido`;
  }

  // Handle "{field} must be {condition}" patterns
  const mustBeMatch = englishMessage.match(/^(.+) must be (.+)\.?$/i);
  if (mustBeMatch) {
    const field = translateField(mustBeMatch[1]);
    return `${field} debe ser ${mustBeMatch[2]}`;
  }

  // Handle MercadoPago dynamic errors - extract the core error
  if (englishMessage.includes("MercadoPago")) {
    if (englishMessage.includes("creation failed")) {
      return "Error al crear el pago. Intentá nuevamente.";
    }
    if (englishMessage.includes("processing failed")) {
      return "Error al procesar el pago. Verificá tus datos.";
    }
    if (englishMessage.includes("failed")) {
      return "Error en el procesamiento del pago. Intentá más tarde.";
    }
  }

  // Handle stock-related errors
  if (englishMessage.toLowerCase().includes("stock") || 
      englishMessage.toLowerCase().includes("inventory") ||
      englishMessage.toLowerCase().includes("quantity")) {
    return "Stock insuficiente para esta cantidad";
  }

  // Handle connection/network errors
  if (englishMessage.toLowerCase().includes("connection") ||
      englishMessage.toLowerCase().includes("network") ||
      englishMessage.toLowerCase().includes("timeout")) {
    return "Error de conexión. Verificá tu internet.";
  }

  // Handle generic "failed to" patterns
  const failedToMatch = englishMessage.match(/^Failed to (.+)\.?$/i);
  if (failedToMatch) {
    return `Error al ${failedToMatch[1].toLowerCase()}`;
  }

  // Handle "Cannot {action}" patterns
  const cannotMatch = englishMessage.match(/^Cannot (.+)\.?$/i);
  if (cannotMatch) {
    return `No se puede ${cannotMatch[1].toLowerCase()}`;
  }

  // Handle "Unable to {action}" patterns
  const unableMatch = englishMessage.match(/^Unable to (.+)\.?$/i);
  if (unableMatch) {
    return `No se pudo ${unableMatch[1].toLowerCase()}`;
  }

  // Fallback: return original message if no translation found
  // This ensures users still see error messages, even if not translated
  return englishMessage;
}

/**
 * Extracts error message from various error object structures
 */
export function extractErrorMessage(error: any, fallback?: string): string {
  // Try different possible error message locations
  return (
    error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.data?.message ||
    error?.error?.message ||
    error?.statusText ||
    fallback ||
    "Error inesperado"
  );
}

/**
 * Extracts MercadoPago status codes from complex error messages
 * Handles patterns like:
 * - "Payment processing failed: Payment failed: rejected: cc_rejected_other_reason"
 * - "Payment failed: rejected: cc_rejected_insufficient_amount"
 * - "rejected: cc_rejected_bad_filled_security_code"
 */
export function extractMercadoPagoStatusCode(errorMessage: string): string | null {
  if (!errorMessage) return null;
  
  // Pattern 1: "Payment processing failed: Payment failed: rejected: cc_rejected_other_reason"
  const complexPattern = /Payment processing failed: Payment failed: rejected: ([a-z_]+)/i;
  const complexMatch = errorMessage.match(complexPattern);
  if (complexMatch && complexMatch[1]) {
    return complexMatch[1];
  }
  
  // Pattern 2: "Payment failed: rejected: cc_rejected_insufficient_amount"
  const paymentFailedPattern = /Payment failed: rejected: ([a-z_]+)/i;
  const paymentFailedMatch = errorMessage.match(paymentFailedPattern);
  if (paymentFailedMatch && paymentFailedMatch[1]) {
    return paymentFailedMatch[1];
  }
  
  // Pattern 3: "Payment failed: status: status_detail"
  const statusDetailPattern = /Payment failed: ([a-z_]+): ([a-z_]+)/i;
  const statusDetailMatch = errorMessage.match(statusDetailPattern);
  if (statusDetailMatch && statusDetailMatch[2]) {
    return statusDetailMatch[2]; // Return the status_detail part
  }
  
  // Pattern 4: "rejected: cc_rejected_other_reason"
  const simplePattern = /rejected: ([a-z_]+)/i;
  const simpleMatch = errorMessage.match(simplePattern);
  if (simpleMatch && simpleMatch[1]) {
    return simpleMatch[1];
  }
  
  // Pattern 5: Direct status code in message (cc_rejected_*, pending_*, approved, etc.)
  const directCodePattern = /(cc_rejected_[a-z_]+|pending_[a-z_]+|approved|rejected|cancelled|in_process|authorized)/i;
  const directMatch = errorMessage.match(directCodePattern);
  if (directMatch && directMatch[1]) {
    return directMatch[1];
  }
  
  return null;
}

/**
 * Comprehensive error translation with extraction and fallback
 */
export function translateAndExtractError(error: any, fallbackMessage?: string): string {
  const englishMessage = extractErrorMessage(error, fallbackMessage);
  return translateError(englishMessage);
}