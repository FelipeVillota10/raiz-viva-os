/**
 * Manejo de errores de la API del backend (Django/DRF)
 * @celula - Celula1
 *
 * Normaliza las distintas shapes de respuesta de error de DRF
 * a un formato consistente con mensajes en español.
 */

/**
 * Error normalizado de la API.
 *
 * - `message`: mensaje legible en español para mostrar al usuario.
 * - `status`: código HTTP (0 si no hubo respuesta).
 * - `fieldErrors`: errores por campo (ej: { email: ["Ya existe"] }).
 * - `responseBody`: cuerpo raw de la respuesta (para debug).
 */
export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;
  responseBody?: string;

  constructor(message: string, status = 0, fieldErrors: Record<string, string[]> = {}, responseBody?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.responseBody = responseBody;
  }

  get hasFieldErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }
}

const FIELD_NAME_MAP: Record<string, string> = {
  email: 'correo electrónico',
  password: 'contraseña',
  nombre: 'nombre',
  nombre_completo: 'nombre completo',
  telefono: 'teléfono',
  region: 'región',
  territorio_nombre: 'nombre del territorio',
  id_territorio: 'territorio',
  id_administrador: 'administrador',
  id_estado: 'estado',
  activo: 'estado',
  servicio: 'servicio',
  descripcion: 'descripción',
  username: 'nombre de usuario',
  first_name: 'nombre',
  last_name: 'apellido',
};

function translateFieldName(field: string): string {
  return FIELD_NAME_MAP[field.toLowerCase()] || field;
}

const EN_TO_ES_MESSAGES: Record<string, string> = {
  'user with this email already exists.': 'Ya existe un usuario con este correo electrónico.',
  'user with this username already exists.': 'Ya existe un usuario con este nombre.',
  'a user with that username already exists.': 'Ya existe un usuario con este nombre de usuario.',
  'this field is required.': 'Este campo es obligatorio.',
  'this field must not be blank.': 'Este campo no puede estar vacío.',
  'enter a valid email address.': 'Ingrese un correo electrónico válido.',
  'enter a valid url.': 'Ingrese una URL válida.',
  'invalid password.': 'Contraseña inválida.',
  'no active account found with the given credentials.': 'Credenciales inválidas.',
  'authentication credentials were not provided.': 'No se proporcionaron credenciales.',
  'invalid token.': 'Sesión inválida.',
  'token is invalid or expired.': 'La sesión expiró. Iniciá sesión nuevamente.',
  'token blacklisted.': 'La sesión ya fue cerrada.',
  'unique constraint violation.': 'Ya existe un registro con estos datos.',
  'integrity error.': 'Error de integridad en los datos.',
};

function translateMessage(msg: string): string {
  const lower = msg.toLowerCase();
  if (EN_TO_ES_MESSAGES[lower]) return EN_TO_ES_MESSAGES[lower];

  if (lower.includes('already exists') || lower.includes('unique constraint')) {
    return 'Ya existe un registro con estos datos.';
  }
  if (lower.includes('required')) {
    return 'Este campo es obligatorio.';
  }
  if (lower.includes('invalid')) {
    return 'El valor ingresado no es válido.';
  }
  if (lower.includes('must be') && lower.includes('characters')) {
    return msg;
  }
  return msg;
}

function parseListValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(v => {
      if (typeof v === 'string') return translateMessage(v);
      return String(v);
    });
  }
  if (typeof value === 'string') return [translateMessage(value)];
  return [String(value)];
}

/**
 * Parsea un objeto JSON de error de DRF y lo convierte en un ApiError.
 *
 * DRF puede responder con distintas shapes:
 *  - `{ detail: "..." }` → error global (401, 403, 404)
 *  - `{ error: "..." }` → error global alternativo
 *  - `{ non_field_errors: [...] }` → errores que no pertenecen a un campo
 *  - `{ message: "..." }` → error global (algunos endpoints custom)
 *  - `{ campo: ["mensaje"] }` → errores por campo (validación 400)
 *  - `{ campo: { subcampo: ["mensaje"] } }` → errores anidados
 *
 * Si hay errores por campo, el mensaje global se construye con el primer campo.
 */
export function parseApiErrorFromData(data: Record<string, unknown>, status: number): ApiError {
  const fieldErrors: Record<string, string[]> = {};

  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    for (const [key, value] of Object.entries(data)) {
      // DRF: { detail: "mensaje" } → error global directo
      if (key === 'detail') {
        return new ApiError(String(value), status);
      }
      // DRF: { error: "mensaje" } → error global alternativo
      if (key === 'error') {
        return new ApiError(String(value), status);
      }
      // DRF: { non_field_errors: [...] } → errores que no pertenecen a un campo específico
      if (key === 'non_field_errors') {
        const msgs = parseListValue(value);
        return new ApiError(msgs.join('; '), status);
      }
      // Endpoint custom: { message: "mensaje" }
      if (key === 'message') {
        return new ApiError(String(value), status);
      }

      // Error anidado: { campo: { subcampo: ["mensaje"] } }
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const nestedMsgs: string[] = [];
        for (const [, nestedValue] of Object.entries(value as Record<string, unknown>)) {
          if (Array.isArray(nestedValue)) {
            nestedMsgs.push(...parseListValue(nestedValue));
          }
        }
        if (nestedMsgs.length > 0) {
          fieldErrors[key] = nestedMsgs.map(m => translateMessage(m));
        }
      } else {
        // Error simple: { campo: ["mensaje"] } o { campo: "mensaje" }
        fieldErrors[key] = parseListValue(value);
      }
    }
  }

  // Construir mensaje global a partir del primer campo con error
  const fieldKeys = Object.keys(fieldErrors);

  if (fieldKeys.length > 0) {
    const firstField = fieldKeys[0];
    const firstMsg = fieldErrors[firstField][0];
    const humanField = translateFieldName(firstField);
    const globalMsg = `Error en ${humanField}: ${firstMsg}`;
    return new ApiError(globalMsg, status, fieldErrors);
  }

  return new ApiError(`Error ${status}`, status);
}

/**
 * Parsea una Response (o error raw) en un ApiError con mensajes en español.
 *
 * Flujo:
 *  1. Si ya es un ApiError, lo devuelve tal cual.
 *  2. Si no es una Response, empaqueta el valor como error genérico.
 *  3. Para códigos comunes (401, 403, 404, 5xx), devuelve mensaje fijo en español.
 *  4. Para otros códigos, intenta parsear el body como JSON y delega a parseApiErrorFromData.
 *  5. Si el body no es JSON, intenta leerlo como texto plano.
 */
export async function parseApiError(response: Response | unknown): Promise<ApiError> {
  if (response instanceof ApiError) {
    return response;
  }

  if (!(response instanceof Response)) {
    return new ApiError(String(response), 0);
  }

  const status = response.status;
  const contentType = response.headers.get('content-type') || '';

  // Mensajes fijos para errores comunes (evita parsear body)
  if (status === 401) {
    return new ApiError('Tu sesión expiró o no tenés permisos. Iniciá sesión nuevamente.', status);
  }
  if (status === 403) {
    return new ApiError('No tenés permisos para realizar esta acción.', status);
  }
  if (status === 404) {
    return new ApiError('El recurso solicitado no fue encontrado.', status);
  }
  if (status >= 500) {
    return new ApiError('Error del servidor. Intentá nuevamente más tarde.', status);
  }

  let data: Record<string, unknown> = {};
  let text = '';

  // Intentar parsear el body según el Content-Type
  if (contentType.includes('application/json')) {
    try {
      data = await response.clone().json();
    } catch {
      // JSON malformado: intentar como texto plano
      try {
        text = await response.clone().text();
      } catch {
        text = '';
      }
      if (text) return new ApiError(text, status);
      return new ApiError(`Error ${status}`, status);
    }
  } else {
    // Body no-JSON: leer como texto plano
    try {
      text = await response.clone().text();
    } catch {
      text = '';
    }
    if (text) return new ApiError(text, status);
    return new ApiError(`Error ${status}`, status);
  }

  // Parsear errores de DRF (mismo patrón que parseApiErrorFromData)
  const fieldErrors: Record<string, string[]> = {};

  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    for (const [key, value] of Object.entries(data)) {
      // DRF: { detail: "mensaje" } → error global directo
      if (key === 'detail') {
        return new ApiError(String(value), status);
      }
      // DRF: { error: "mensaje" } → error global alternativo
      if (key === 'error') {
        return new ApiError(String(value), status);
      }
      // DRF: { non_field_errors: [...] } → errores que no pertenecen a un campo específico
      if (key === 'non_field_errors') {
        const msgs = parseListValue(value);
        return new ApiError(msgs.join('; '), status);
      }
      // Endpoint custom: { message: "mensaje" }
      if (key === 'message') {
        return new ApiError(String(value), status);
      }

      // Error anidado: { campo: { subcampo: ["mensaje"] } }
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const nestedMsgs: string[] = [];
        for (const [, nestedValue] of Object.entries(value as Record<string, unknown>)) {
          if (Array.isArray(nestedValue)) {
            nestedMsgs.push(...parseListValue(nestedValue));
          }
        }
        if (nestedMsgs.length > 0) {
          fieldErrors[key] = nestedMsgs.map(m => translateMessage(m));
        }
      } else {
        // Error simple: { campo: ["mensaje"] } o { campo: "mensaje" }
        fieldErrors[key] = parseListValue(value);
      }
    }
  }

  // Construir mensaje global a partir del primer campo con error
  const fieldKeys = Object.keys(fieldErrors);

  if (fieldKeys.length > 0) {
    const firstField = fieldKeys[0];
    const firstMsg = fieldErrors[firstField][0];
    const humanField = translateFieldName(firstField);
    const globalMsg = `Error en ${humanField}: ${firstMsg}`;
    return new ApiError(globalMsg, status, fieldErrors);
  }

  return new ApiError(`Error ${status}`, status);
}