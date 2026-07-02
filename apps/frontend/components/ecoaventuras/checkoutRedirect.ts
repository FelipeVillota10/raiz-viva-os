/**
 * HU16.2 — Clave compartida para el retorno automático al flujo de pago de C3.
 *
 * Antes de redirigir a un usuario no autenticado al login existente de Célula 1,
 * el checkout guarda en sessionStorage el destino al que debe volver. Tras un
 * login exitoso, un watcher montado globalmente (PaqueteCarrito) lee esta clave
 * y devuelve al usuario al checkout automáticamente.
 */
export const POST_LOGIN_REDIRECT_KEY = "paquete_post_login_redirect";
