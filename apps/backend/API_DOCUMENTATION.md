# Raiz Viva - API Documentation

> **Generada automaticamente** el 2026-06-14 desde la rama `desarrollo`.
> Servidor: Django 5.1 + DRF | Base URL: `http://localhost:8000`

---

## Tabla de contenidos

1. [Autenticacion](#1-autenticacion)
2. [Catalogos publicos](#2-catalogos-publicos)
3. [Clientes](#3-clientes)
4. [Perfil de usuario](#4-perfil-de-usuario)
5. [Registro](#5-registro)
6. [Aprobaciones (lider)](#6-aprobaciones-lider)
7. [Lider - Actores](#7-lider---actores)
8. [Admin - Territorios](#8-admin---territorios)
9. [Admin - Lideres](#9-admin---lideres)
10. [Eventos](#10-eventos)
11. [Categorias de eventos](#11-categorias-de-eventos)
12. [EcoAventuras](#12-ecoaventuras)
13. [Paquete (carrito)](#13-paquete-carrito)
14. [Comentarios](#14-comentarios)
15. [Growth (metricas)](#15-growth-metricas)
16. [Servicios](#16-servicios)
17. [Errores conocidos](#17-errores-conocidos)

---

## Informacion general

### Autenticacion

La API usa **JWT Bearer tokens**. Para endpoints protegidos, enviar el header:

```
Authorization: Bearer <access_token>
```

El token se obtiene con `POST /api/token/`.

### Roles

| Rol | Flag en JWT | Descripcion |
|-----|-------------|-------------|
| Admin | `es_admin: true` | Acceso total al panel administrativo |
| Lider | `es_lider: true` | Gestiona territorio y aprueba/rechaza actores |
| Actor | `es_actor: true` | Actor territorial (productor, guia, anfitrion, etc.) |
| Turista | `es_turista: true` | Usuario visitante |

### Codigos de respuesta

| Codigo | Significado |
|--------|-------------|
| 200 | Exito (GET, PATCH, PUT) |
| 201 | Creado (POST) |
| 400 | Datos invalidos o campo faltante |
| 401 | Token JWT faltante o invalido |
| 403 | Sin permisos para este recurso |
| 404 | Recurso no encontrado |
| 409 | Conflicto (ej. recurso duplicado) |
| 500 | Error interno del servidor |

---

## 1. Autenticacion

### POST /api/token/

Obtiene un JWT de acceso y refresco.

**Auth:** Publica (no requiere token)

**Request body:**
```json
{
  "username": "usuario@correo.com",
  "password": "Password123"
}
```

**Response 200:**
```json
{
  "refresh": "eyJhbGci...",
  "access": "eyJhbGci..."
}
```

**Claims del access token:**
```json
{
  "user_id": 7,
  "es_actor": false,
  "es_lider": false,
  "es_turista": false,
  "es_admin": true,
  "nombre_completo": "Admin RaizViva",
  "territorio": "activo"
}
```

**Errores:**
- 400: `{"detail": "No active account found with the given credentials"}`

---

### POST /api/token/refresh/

Refresca un access token expirado.

**Auth:** Publica

**Request body:**
```json
{
  "refresh": "eyJhbGci..."
}
```

**Response 200:**
```json
{
  "access": "eyJhbGci..."
}
```

---

## 2. Catalogos publicos

### GET /api/estados/

Lista todos los estados del sistema.

**Auth:** Publica

**Response 200:**
```json
[
  {"id": 1, "nombre_estado": "en_revision"},
  {"id": 2, "nombre_estado": "rechazado"},
  {"id": 3, "nombre_estado": "aprobado"},
  {"id": 4, "nombre_estado": "activo"},
  {"id": 5, "nombre_estado": "inactivo"}
]
```

---

### GET /api/monedas/

Lista todas las monedas disponibles.

**Auth:** Publica

**Response 200:**
```json
[
  {"id": 1, "nombre": "europea", "simbolo": "EUR"},
  {"id": 2, "nombre": "estadounidense", "simbolo": "USD"},
  {"id": 3, "nombre": "colombiana", "simbolo": "COP"}
]
```

---

### GET /api/territorios/

Lista todos los territorios.

**Auth:** Publica

**Response 200:**
```json
[
  {"id_territorio": 1, "nombre_territorio": "Buitrera", "region": "Zona Rural Palmira"},
  {"id_territorio": 2, "nombre_territorio": "La Torre", "region": "Zona Urbana Palmira"}
]
```

---

### GET /api/tipos-actores/

Lista todos los tipos de actores.

**Auth:** Publica

**Response 200:**
```json
[
  {"id": 1, "nombre_tipo": "productor", "descripcion": "Suministro de productos locales y artesanales"},
  {"id": 2, "nombre_tipo": "caminante", "descripcion": "Guia de rutas e interprete de saberes"},
  {"id": 3, "nombre_tipo": "custodio", "descripcion": "Proteccion de biodiversidad y patrimonio"},
  {"id": 4, "nombre_tipo": "facilitador", "descripcion": "Tallerista y gestor de experiencias"},
  {"id": 5, "nombre_tipo": "anfitrion", "descripcion": "Gestor de alojamiento, gastronomia y transporte"},
  {"id": 6, "nombre_tipo": "turista", "descripcion": "Visitante de experiencias"}
]
```

---

## 3. Clientes

### GET /api/clientes/

Lista todos los clientes registrados.

**Auth:** Publica

**Response 200:**
```json
[
  {
    "id_cliente": 1,
    "nombre": "Maria Lopez",
    "telefono": "3001234567",
    "usuario_username": "lider_buitrera",
    "usuario_email": "lider.buitrera@raizviva.com",
    "usuario_nombre": "Maria Lopez",
    "reputacion": "95.00",
    "es_actor": false,
    "es_lider": true,
    "es_turista": false,
    "territorio_nombre": "activo",
    "moneda_nombre": "europea",
    "tipos_actores": [],
    "servicio": "",
    "descripcion": null,
    "foto_perfil": null,
    "foto_portada": null,
    "foto_perfil_url": null,
    "foto_portada_url": null,
    "activo": true,
    "estado_aprobacion": null,
    "observaciones": null,
    "direccion": null
  }
]
```

---

### GET /api/clientes/{id_cliente}/

Retorna un cliente especifico por ID.

**Auth:** Publica

**Response 200:**
```json
{
  "id_cliente": 1,
  "nombre": "Maria Lopez",
  "nombre_completo": "Maria Lopez",
  "telefono": "3001234567",
  "usuario_username": "lider_buitrera",
  "usuario_email": "lider.buitrera@raizviva.com",
  "reputacion": "95.00",
  "es_actor": false,
  "es_lider": true,
  "es_turista": false,
  "territorio_nombre": "Buitrera",
  "territorio_id": 1,
  "moneda_nombre": "europea",
  "tipos_actores": [],
  "servicio": "",
  "activo": true,
  "estado_aprobacion": null,
  "observaciones": null
}
```

**Errores:**
- 404: Cliente no encontrado

---

## 4. Perfil de usuario

### GET /api/auth/me/

Retorna el perfil del usuario autenticado (decodificado del JWT).

**Auth:** JWT requerido (cualquier rol)

**Response 200:**
```json
{
  "id_cliente": 21,
  "nombre": "Juan pablo",
  "nombre_completo": "Juan pablo",
  "telefono": "3158081674",
  "usuario_username": "juan",
  "usuario_email": "juan@gmail.com",
  "usuario_nombre": "Juan pablo",
  "reputacion": null,
  "es_actor": false,
  "es_lider": false,
  "es_turista": true,
  "es_admin": false,
  "territorio_nombre": null,
  "territorio_id": null,
  "moneda_nombre": "europea",
  "tipos_actores": [
    {"id": 6, "nombre_tipo": "turista"}
  ],
  "servicio": "",
  "descripcion": null,
  "foto_perfil": null,
  "foto_portada": null,
  "foto_perfil_url": null,
  "foto_portada_url": null,
  "activo": true,
  "estado_aprobacion": null,
  "observaciones": null
}
```

**Errores:**
- 401: Token invalido o expirado

---

### PATCH /api/perfil/actualizar/

Actualiza parcialmente el perfil del usuario autenticado.

**Auth:** JWT requerido

**Request body (multipart/form-data):**
```json
{
  "nombre": "Nuevo nombre (min 3 chars)",
  "descripcion": "Descripcion (max 250 chars)",
  "foto_perfil": "(archivo de imagen)",
  "foto_portada": "(archivo de imagen)"
}
```

**Response 200:** Perfil del usuario actualizado (mismo formato que `GET /api/auth/me/`)

---

### GET /api/perfil/servicios/

Lista los servicios asignados al usuario autenticado.

**Auth:** JWT requerido

**Response 200:**
```json
[]
```

O con datos:
```json
[
  {
    "id": 1,
    "servicio_id": 1,
    "nombre": "Restaurante",
    "descripcion": "...",
    "precio_acordado": "50000.00",
    "unidad": "por persona"
  }
]
```

---

### POST /api/perfil/servicios/

Agrega un servicio al perfil del usuario autenticado.

**Auth:** JWT requerido

**Request body:**
```json
{
  "servicio_id": 1,
  "precio_acordado": 50000
}
```

**Response 201:**
```json
{
  "id": 1,
  "servicio_id": 1,
  "nombre": "Restaurante",
  "precio_acordado": "50000.00"
}
```

---

### PATCH /api/perfil/servicios/{servicio_id}/

Actualiza el precio_acordado de un servicio asignado.

**Auth:** JWT requerido

**Request body:**
```json
{
  "precio_acordado": 75000
}
```

---

### DELETE /api/perfil/servicios/{servicio_id}/

Elimina un servicio del perfil del usuario autenticado.

**Auth:** JWT requerido

**Response 200:**
```json
{
  "mensaje": "Servicio eliminado"
}
```

---

## 5. Registro

### POST /api/registro/cliente/

Crea una nueva cuenta de usuario + cliente.

**Auth:** Publica

**Request body:**
```json
{
  "nombre_completo": "Juan Perez (min 5 chars, min 2 palabras, sin digitos)",
  "email": "juan@correo.com",
  "password": "Password1 (min 8 chars, 1 mayuscula, 1 digito)",
  "telefono": "3001234567 (7-15 digitos)",
  "id_territorio": 1,
  "id_tipo_moneda": 1,
  "tipos_actores": [6],
  "servicios": []
}
```

**Response 201:**
```json
{
  "mensaje": "Registro exitoso",
  "correo": "juan@correo.com",
  "cliente": {
    "id_cliente": 21,
    "nombre": "Juan Perez",
    "nombre_completo": "Juan Perez",
    "telefono": "3001234567",
    "usuario_username": "juan",
    "usuario_email": "juan@correo.com",
    "usuario_nombre": "Juan Perez",
    "reputacion": null,
    "es_actor": false,
    "es_lider": false,
    "es_turista": true,
    "es_admin": false,
    "territorio_nombre": null,
    "territorio_id": null,
    "moneda_nombre": "europea",
    "tipos_actores": [{"id": 6, "nombre_tipo": "turista"}],
    "servicio": "",
    "descripcion": null,
    "foto_perfil": null,
    "foto_portada": null,
    "foto_perfil_url": null,
    "foto_portada_url": null,
    "activo": true,
    "estado_aprobacion": null,
    "observaciones": null
  }
}
```

**Notas:**
- Si `es_turista`, la cuenta se activa automaticamente.
- Si `es_actor`, inicia en estado `en_revision` (requiere aprobacion del lider).

---

## 6. Aprobaciones (lider)

### GET /api/solicitudes/

Lista las solicitudes de aprobacion del lider autenticado.

**Auth:** JWT requerido (rol lider)

**Query params opcionales:**
- `?estado=EN_REVISION` (o `APROBADO`, `RECHAZADO`)

**Response 200:**
```json
[
  {
    "id_aprobacion": 2,
    "actor_info": {
      "id_cliente": 4,
      "nombre": "Ana Rodriguez",
      "telefono": "3098765432",
      "usuario_username": "caminante_palmira",
      "usuario_email": "caminante.palmira@raizviva.com",
      "es_actor": true,
      "es_lider": false,
      "es_turista": false,
      "tipos_actores": [{"id": 2, "nombre_tipo": "caminante"}],
      "servicio": "Guia de caminata, Interpretacion cultural",
      "activo": true,
      "estado_aprobacion": "EN_REVISION"
    },
    "lider_info": {
      "id_cliente": 1,
      "nombre": "Maria Lopez",
      "usuario_email": "lider.buitrera@raizviva.com",
      "es_lider": true,
      "territorio_nombre": "Buitrera"
    },
    "estado_resultado": "EN_REVISION",
    "observaciones": null,
    "fecha_solicitud": "2026-05-26T03:51:06.405261Z",
    "fecha_respuesta": null
  }
]
```

---

### GET /api/solicitudes/{id_aprobacion}/

Retorna una solicitud especifica.

**Auth:** JWT requerido (rol lider)

**Response 200:** Mismo formato que el item individual de la lista anterior.

---

### PATCH /api/solicitudes/{id_aprobacion}/actualizar/

Aprueba o rechaza una solicitud de actor.

**Auth:** JWT requerido (rol lider)

**Request body:**
```json
{
  "estado": "APROBADO",
  "observaciones": "Bienvenido al equipo."
}
```

**Valores validos para `estado`:**
- `EN_REVISION` - Mantiene en revision
- `APROBADO` - Aprueba el actor (activa la cuenta, envia email)
- `RECHAZADO` - Rechaza el actor (marca como rechazado, envia email)

**Response 200:** Solicitud actualizada

---

### GET /api/lider/dashboard/

Resumen del dashboard del lider (contadores).

**Auth:** JWT requerido (rol lider)

**Response 200 (esperado):**
```json
{
  "total": 3,
  "en_revision": 2,
  "aprobados": 1,
  "rechazados": 0
}
```

> **NOTA BUG:** Actualmente devuelve error 500 (FieldError). Ver [Errores conocidos](#17-errores-conocidos).

---

## 7. Lider - Actores

### GET /api/lider/actores/

Lista los actores territoriales asignados al lider autenticado.

**Auth:** JWT requerido (rol lider)

**Response 200:**
```json
[
  {
    "id_cliente": 5,
    "nombre": "Pedro Sanchez",
    "telefono": "3101234567",
    "email": "anfitrion.buitrera@raizviva.com",
    "territorio_nombre": "Buitrera",
    "tipos_actores": [{"id": 5, "nombre_tipo": "anfitrion"}],
    "activo": true
  }
]
```

---

### PATCH /api/lider/actores/{actor_id}/toggle-estado/

Habilita o deshabilita un actor territorial.

**Auth:** JWT requerido (rol lider)

**Request body:**
```json
{
  "accion": "deshabilitar"
}
```

**Valores validos para `accion`:**
- `habilitar` - Activa el actor
- `deshabilitar` - Desactiva el actor (por defecto si no se envia)

**Response 200:**
```json
{
  "mensaje": "Actor deshabilitado correctamente"
}
```

---

## 8. Admin - Territorios

### GET /api/admin/territorios/

Lista todos los territorios con info de administrador.

**Auth:** JWT requerido (rol admin)

**Response 200:**
```json
[
  {
    "id_territorio": 1,
    "nombre_territorio": "Buitrera",
    "region": "Zona Rural Palmira",
    "estado_nombre": "activo",
    "id_estado": 4,
    "administrador_nombre": "Maria Lopez",
    "administrador_id": 1,
    "administrador_activo": true
  }
]
```

**Query params:**
- `?search=Buitrera` - Filtra por nombre de territorio

---

### GET /api/admin/territorios/{id_territorio}/

Retorna un territorio especifico con info de administrador.

**Auth:** JWT requerido (rol admin)

**Response 200:** Mismo formato que el item individual.

---

### POST /api/admin/territorios/

Crea un nuevo territorio.

**Auth:** JWT requerido (rol admin)

**Request body:**
```json
{
  "nombre_territorio": "Nuevo Territorio",
  "region": "Region",
  "id_administrador": 1
}
```

**Validaciones:**
- El administrador debe tener `es_lider: true`
- El administrador no puede tener otro territorio asignado

**Response 201:** Territorio creado

---

### PATCH /api/admin/territorios/{id_territorio}/

Actualiza un territorio.

**Auth:** JWT requerido (rol admin)

**Request body:**
```json
{
  "nombre_territorio": "Nombre actualizado",
  "region": "Region actualizada",
  "id_estado": 4,
  "administrador_activo": true
}
```

---

## 9. Admin - Lideres

### GET /api/admin/lideres/

Lista todos los lideres.

**Auth:** JWT requerido (rol admin)

**Query params:**
- `?disponibles=true` - Solo lideres sin territorio asignado

**Response 200:**
```json
[
  {
    "id_cliente": 1,
    "nombre": "Maria Lopez",
    "telefono": "3001234567",
    "usuario_email": "lider.buitrera@raizviva.com",
    "activo": true,
    "foto_perfil_url": null,
    "territorio_nombre": "Buitrera",
    "territorio_id": 1
  }
]
```

---

### GET /api/admin/lideres/{id_cliente}/

Retorna un lider especifico.

**Auth:** JWT requerido (rol admin)

**Response 200:**
```json
{
  "id_cliente": 1,
  "nombre": "Maria Lopez",
  "nombre_completo": "Maria Lopez",
  "telefono": "3001234567",
  "usuario_username": "lider_buitrera",
  "usuario_email": "lider.buitrera@raizviva.com",
  "es_actor": false,
  "es_lider": true,
  "es_turista": false,
  "es_admin": false,
  "territorio_nombre": "Buitrera",
  "territorio_id": 1,
  "moneda_nombre": "europea",
  "activo": true
}
```

---

### PATCH /api/admin/lideres/{id_cliente}/

Actualiza un lider.

**Auth:** JWT requerido (rol admin)

**Request body (multipart/form-data):**
```json
{
  "nombre": "Nombre actualizado",
  "telefono": "3001234567",
  "activo": true,
  "email": "nuevo@correo.com",
  "foto_perfil": "(archivo de imagen)",
  "territorio_id": 1
}
```

**Notas:**
- Si se cambia `territorio_id`, las aprobaciones pendientes del territorio anterior se transfieren al nuevo lider.

---

### POST /api/usuarios/admin/registrar-lider/

El admin crea un nuevo lider.

**Auth:** JWT requerido (rol admin)

**Request body:**
```json
{
  "nombre_completo": "Nuevo Lider (min 5 chars)",
  "email": "lider@correo.com",
  "password": "Password1",
  "telefono": "3001234567",
  "id_territorio": 1,
  "id_tipo_moneda": 1,
  "tipos_actores": [],
  "servicios": []
}
```

**Response 201:**
```json
{
  "mensaje": "Lider registrado exitosamente",
  "lider": {
    "id_cliente": 22,
    "nombre": "Nuevo Lider",
    "telefono": "3001234567",
    "usuario_email": "lider@correo.com",
    "activo": true,
    "foto_perfil_url": null,
    "territorio_nombre": null,
    "territorio_id": null
  }
}
```

---

## 10. Eventos

### GET /api/eventos/

Lista todos los eventos.

**Auth:** Publica

**Response 200:**
```json
[]
```

(Actualmente no hay eventos en la DB local)

---

### GET /api/eventos/{id_evento}/

Retorna un evento especifico.

**Auth:** Publica

**Response 200:**
```json
{
  "id_evento": 1,
  "nombre": "...",
  "descripcion": "...",
  "costo_evento": "0.00",
  "capacidad": 50,
  "fecha_inicio": "2026-07-01T10:00:00Z",
  "fecha_fin": "2026-07-01T18:00:00Z",
  "es_gratuito": true,
  "id_estado": {...},
  "id_territorio": 1,
  "id_actor_principal": 5,
  "imagen": "url",
  "id_categoria": {...},
  "detalle": {...},
  "productos": [...]
}
```

---

### POST /api/eventos/

Crea un nuevo evento.

**Auth:** Publica (sin JWT en codigo)

**Request body (multipart/form-data):**
```json
{
  "nombre": "Nombre del evento (requerido)",
  "descripcion": "Descripcion (requerido)",
  "fecha_inicio": "2026-07-01T10:00:00Z (requerido)",
  "fecha_fin": "2026-07-01T18:00:00Z (requerido, >= fecha_inicio)",
  "capacidad": 50 (requerido, > 0),
  "costo_evento": 0 (opcional),
  "es_gratuito": false (opcional, si true -> costo = 0),
  "id_categoria": 1 (opcional),
  "imagen": "(archivo, max 5MB, .jpg/.jpeg/.png)"
}
```

**Response 201:** Evento creado (estado inicial: `Borrador`)

---

### PUT /api/eventos/{id_evento}/

Actualiza completamente un evento.

**Auth:** Publica

**Request body:** Mismo que POST

---

### PATCH /api/eventos/{id_evento}/

Realiza una accion de transicion de estado sobre el evento.

**Auth:** Publica

**Request body:**
```json
{
  "accion": "publicar"
}
```

**Acciones validas:**
- `publicar` - Cambia estado a `En revision`
- `inactivar` - Cambia estado a `Inactivo`

**Response 200:** Evento actualizado

---

## 11. Categorias de eventos

### GET /api/categorias-eventos/

Lista todas las categorias de eventos.

**Auth:** Publica

**Response 200:**
```json
[]
```

(Actualmente no hay categorias en la DB local)

---

### GET /api/categorias-eventos/{id}/

Retorna una categoria especifica.

**Auth:** Publica

---

## 12. EcoAventuras

### GET /api/ecoaventuras/

Lista eco-aventuras **activas** con filtros y paginacion.

**Auth:** Publica

**Query params opcionales:**
- `?precio_min=10000`
- `?precio_max=50000`
- `?duracion_min=2`
- `?duracion_max=8`
- `?dificultad=BAJA` (o `MEDIA`, `ALTA`)
- `?ubicacion=Palmira`
- `?page=1`
- `?page_size=9` (default: 9)

**Response 200:**
```json
{
  "count": 0,
  "total_pages": 1,
  "page": 1,
  "page_size": 9,
  "results": []
}
```

Con datos:
```json
{
  "count": 5,
  "total_pages": 1,
  "page": 1,
  "page_size": 9,
  "results": [
    {
      "id": 1,
      "nombre": "Caminata al Volcan",
      "imagen_url": "https://...",
      "precio": "25000.00",
      "ubicacion": "Nevado del Ruiz",
      "dificultad": "MEDIA",
      "dificultad_display": "Media",
      "duracion": 4,
      "duracion_display": "4 horas",
      "capacidad_maxima": 15
    }
  ]
}
```

---

### GET /api/ecoaventuras/admin/

Lista **todas** las eco-aventuras (activas + inactivas) para el panel admin.

**Auth:** Publica

**Response 200:**
```json
[]
```

---

### GET /api/ecoaventuras/{id}/

Retorna el detalle completo de una eco-aventura.

**Auth:** Publica

**Response 200:**
```json
{
  "id": 1,
  "nombre": "Caminata al Volcan",
  "descripcion": "...",
  "ubicacion": "Nevado del Ruiz",
  "dificultad": "MEDIA",
  "duracion": 4,
  "capacidad_maxima": 15,
  "precio": "25000.00",
  "imagen_url": "https://...",
  "fecha_inicio": "2026-07-01",
  "fecha_fin": "2026-12-31",
  "activo": true,
  "territorio": 7,
  "itinerario": {...}
}
```

---

### POST /api/ecoaventuras/

Crea una nueva eco-aventura.

**Auth:** Publica

**Request body:**
```json
{
  "nombre": "Nombre (requerido)",
  "descripcion": "Descripcion",
  "ubicacion": "Ubicacion",
  "dificultad": "BAJA|MEDIA|ALTA",
  "duracion": 4 (> 0, requerido),
  "capacidad_maxima": 15 (> 0, requerido),
  "precio": 25000 (> 0, requerido),
  "imagen_url": "https://...",
  "fecha_inicio": "2026-07-01",
  "fecha_fin": "2026-12-31",
  "activo": true,
  "territorio": 7
}
```

**Validaciones:**
- `fecha_inicio` <= `fecha_fin`
- `duracion` > 0
- `capacidad_maxima` > 0
- `precio` > 0

**Response 201:** Eco-aventura creada con itinerario

---

### PUT /api/ecoaventuras/{id}/

Actualiza completamente una eco-aventura.

**Auth:** Publica

**Request body:** Mismo que POST

---

### PATCH /api/ecoaventuras/{id}/

Actualizacion parcial o toggle de estado.

**Auth:** Publica

**Request body (parcial):**
```json
{
  "precio": 30000
}
```

**Request body (toggle):**
```json
{
  "toggle_activo": true
}
```

Si `toggle_activo: true`, invierte el valor de `activo` (true->false, false->true).

---

### GET /api/ecoaventuras/{id}/itinerario/

Retorna el itinerario de una eco-aventura.

**Auth:** Publica

**Response 200:**
```json
{
  "itinerario": {
    "cronograma": "...",
    "actividades": "...",
    "transporte": "...",
    "restricciones": "...",
    "recomendaciones": "...",
    "contactos": "...",
    "notas_especiales": "..."
  }
}
```

Si no existe: `{"itinerario": null}`

---

### POST /api/ecoaventuras/{id}/itinerario/

Crea o actualiza el itinerario de una eco-aventura.

**Auth:** Publica

**Request body:**
```json
{
  "cronograma": "Dia 1: ...",
  "actividades": "Caminata, observacion...",
  "transporte": "Bus desde Palmira",
  "restricciones": "No menores de 12",
  "recomendaciones": "Llevar agua y bloqueador",
  "contactos": "+57 300...",
  "notas_especiales": "..."
}
```

**Response 200:** Itinerario guardado

---

## 13. Paquete (carrito)

El paquete usa **sesiones de Django** (no JWT). Se crea/obtiene una sesion automaticamente.

**Auth:** Session (cookie `sessionid`)

### GET /api/paquete/

Retorna el paquete actual de la sesion.

**Response 200:**
```json
{
  "id": 1,
  "session_key": "027df443-994b-43b7-9941-97ce1512e033",
  "items": [],
  "total": 0,
  "num_items": 0,
  "creado_en": "2026-06-14T02:58:37.748764Z",
  "actualizado_en": "2026-06-14T02:58:37.748792Z"
}
```

Con items:
```json
{
  "id": 1,
  "session_key": "...",
  "items": [
    {
      "id": 1,
      "ecoaventura": {... resumen de eco-aventura ...},
      "ecoaventura_id": 1,
      "cantidad": 1,
      "fecha_reserva": "2026-07-15",
      "num_personas": 2,
      "subtotal": "50000.00",
      "agregado_en": "2026-06-14T03:00:00Z"
    }
  ],
  "total": 50000,
  "num_items": 1,
  "creado_en": "...",
  "actualizado_en": "..."
}
```

---

### POST /api/paquete/agregar/

Agrega una experiencia eco-aventura al paquete.

**Request body:**
```json
{
  "ecoaventura_id": 1,
  "fecha_reserva": "2026-07-15",
  "num_personas": 2
}
```

**Validaciones:**
- `ecoaventura_id` requerido
- `num_personas` >= 1 (default: 1)
- No puede duplicar misma ecoaventura + fecha_reserva (409)
- Minimo global de personas (configurable via `ReglasConfig`)
- Maximo global de actividades por paquete (configurable)
- Capacidad real por eco-aventura por fecha (cross-user)

**Response 201:** Paquete actualizado
```json
{
  "id": 1,
  "session_key": "027df443-...",
  "items": [
    {
      "id": 1,
      "ecoaventura": {"id": 1, "nombre": "Caminata al Volcan", "precio": "25000.00", ...},
      "ecoaventura_id": 1,
      "cantidad": 1,
      "fecha_reserva": "2026-07-15",
      "num_personas": 2,
      "subtotal": "50000.00",
      "agregado_en": "2026-06-14T03:00:00Z"
    }
  ],
  "total": 50000,
  "num_items": 1,
  "creado_en": "2026-06-14T02:58:37.748764Z",
  "actualizado_en": "2026-06-14T03:00:00Z"
}
```

**Errores:**
- 400: `ecoaventura_id` faltante o `num_personas` invalido
- 404: Eco-aventura no existe
- 409: Item duplicado

---

### DELETE /api/paquete/

Vacia (elimina todos los items del) paquete actual.

**Response 200:** Paquete vacio
```json
{
  "id": 1,
  "session_key": "027df443-...",
  "items": [],
  "total": 0,
  "num_items": 0,
  "creado_en": "2026-06-14T02:58:37.748764Z",
  "actualizado_en": "2026-06-14T03:00:00Z"
}
```

---

### DELETE /api/paquete/items/{item_id}/

Elimina un item especifico del paquete.

**Response 200:** Paquete actualizado (mismo formato que `GET /api/paquete/`)

**Errores:**
- 404: Item no encontrado o no pertenece a la sesion

---

## 14. Comentarios

### GET /api/comentarios/

Lista todos los comentarios.

**Auth:** Publica

**Query params opcionales:**
- `?categoria=sugerencia` (o `bug`, `mejora`, `otro`)
- `?estado=pendiente` (o `revision`, `resuelto`, `rechazado`)
- `?prioridad=3` (1-5)

**Response 200:**
```json
[]
```

---

### GET /api/comentarios/tendencias/

Retorna metricas agregadas de comentarios.

**Auth:** Publica

**Response 200:**
```json
{
  "total_comentarios": 0,
  "por_categoria": [],
  "por_estado": [],
  "prioridades_altas": 0
}
```

---

### GET /api/comentarios/{id_comentario}/

Retorna un comentario especifico.

**Auth:** Publica

---

### POST /api/comentarios/

Crea un nuevo comentario.

**Auth:** Publica

**Request body:**
```json
{
  "titulo": "Titulo del comentario",
  "descripcion": "Descripcion detallada",
  "categoria": "sugerencia",
  "prioridad": 3,
  "visible_para": "admin"
}
```

**Response 201:**
```json
{
  "id": 1,
  "titulo": "Titulo del comentario",
  "descripcion": "Descripcion detallada",
  "categoria": "sugerencia",
  "prioridad": 3,
  "visible_para": "admin",
  "estado": "pendiente",
  "created_at": "2026-06-14T03:17:27.979390Z",
  "updated_at": "2026-06-14T03:17:27.979416Z"
}
```

---

### PATCH /api/comentarios/{id_comentario}/

Actualiza parcialmente un comentario (usa `clasificar_comentario`).

**Auth:** Publica

**Request body:**
```json
{
  "estado": "resuelto",
  "categoria": "mejora",
  "prioridad": 5,
  "visible_para": "todos"
}
```

**Response 200:** Comentario actualizado (mismo formato que `GET /api/comentarios/{id}/`)

---

### DELETE /api/comentarios/{id_comentario}/

Elimina un comentario.

**Auth:** Publica

**Response 200:**
```json
{
  "message": "Comentario eliminado correctamente"
}
```

---

## 15. Growth (metricas)

### GET /api/growth/

Retorna metricas agregadas del dashboard de Growth.

**Auth:** Publica

**Response 200 (esperado):**
```json
{
  "usuarios_activos": 10,
  "actores_activos": 5,
  "eventos_realizados": 3,
  "ventas_totales": 1500000,
  "ventas_actores_locales": 800000
}
```

> **NOTA BUG:** Actualmente devuelve error 500 (ProgrammingError). Ver [Errores conocidos](#17-errores-conocidos).

---

## 16. Servicios

### GET /api/servicios/

Lista el catalogo completo de servicios.

**Auth:** Publica

**Response 200:**
```json
[
  {
    "id": 1,
    "nombre": "Restaurante",
    "descripcion": "Servicio de alimentacion con productos locales",
    "precio_base": null,
    "unidad": "por persona"
  },
  {
    "id": 2,
    "nombre": "Hoteleria",
    "descripcion": "Alojamiento en casas rurales y hospedajes comunitarios",
    "precio_base": null,
    "unidad": "por noche"
  },
  {
    "id": 3,
    "nombre": "Spa",
    "descripcion": "Tratamientos naturales con plantas y saberes ancestrales",
    "precio_base": null,
    "unidad": "por sesion"
  },
  {
    "id": 4,
    "nombre": "Guia de caminata",
    "descripcion": "Recorridos guiados por senderos naturales y culturales",
    "precio_base": null,
    "unidad": "por persona"
  },
  {
    "id": 5,
    "nombre": "Artesanias",
    "descripcion": "Elaboracion y venta de piezas artesanales locales",
    "precio_base": null,
    "unidad": "por pieza"
  },
  {
    "id": 6,
    "nombre": "Transporte",
    "descripcion": "Movilidad interna dentro del territorio",
    "precio_base": null,
    "unidad": "por trayecto"
  },
  {
    "id": 7,
    "nombre": "Taller gastronomico",
    "descripcion": "Talleres de cocina tradicional y productos locales",
    "precio_base": null,
    "unidad": "por persona"
  },
  {
    "id": 8,
    "nombre": "Interpretacion cultural",
    "descripcion": "Narracion de historias, mitos y saberes del territorio",
    "precio_base": null,
    "unidad": "por grupo"
  },
  {
    "id": 9,
    "nombre": "Agricultura",
    "descripcion": "Venta directa de productos agricolas organicos",
    "precio_base": null,
    "unidad": "por kilo"
  },
  {
    "id": 10,
    "nombre": "Experiencia vivencial",
    "descripcion": "Inmersion en la vida cotidiana de la comunidad",
    "precio_base": null,
    "unidad": "por dia"
  }
]
```

---

### GET /api/clientes/{cliente_id}/servicios/

Lista los servicios asignados a un cliente especifico.

**Auth:** Publica

**Response 200:**
```json
[]
```

---

### POST /api/clientes/{cliente_id}/servicios/

Agrega un servicio a un cliente.

**Auth:** Publica

**Request body:**
```json
{
  "servicio_id": 1,
  "precio_acordado": 50000
}
```

**Response 201:**
```json
{
  "mensaje": "Servicio agregado al cliente",
  "cliente_servicio": {
    "id": 1,
    "nombre": "Restaurante",
    "precio_acordado": "50000.00"
  }
}
```

---

### DELETE /api/clientes/{cliente_id}/servicios/

Elimina un servicio de un cliente.

**Auth:** Publica

**Request body:**
```json
{
  "servicio_id": 1
}
```

**Response 200:**
```json
{
  "mensaje": "Servicio eliminado del cliente"
}
```

---

## 17. Errores conocidos

Los siguientes endpoints presentan errores en la rama `desarrollo`:

### GET /api/growth/ - Error 500

**Error:** `ProgrammingError: relation "consolidado_eventos" does not exist`

**Causa:** La tabla `consolidado_eventos` no existe en la DB local. El modelo `ConsolidadoEvento` esta en `INSTALLED_APPS` pero no tiene migraciones aplicadas (o la tabla nunca fue creada).

**Impacto:** El dashboard de Growth no funciona.

**Fix sugerido:** Ejecutar migraciones pendientes para la app `ConsolidadoEvento`, o agregar la tabla manualmente.

---

### GET /api/lider/dashboard/ - Error 500

**Error:** `FieldError: Cannot resolve keyword 'id' into field. Choices are: estado_resultado, fecha_respuesta, fecha_solicitud, id_actor, id_actor_id, id_aprobacion, id_lider, id_lider_id, observaciones`

**Causa:** El codigo del controller intenta hacer `.count()` o `.filter()` usando `id` como campo, pero el modelo `Aprobaciones` usa `id_aprobacion` como primary key (no `id`).

**Impacto:** El dashboard del lider no muestra contadores.

**Fix sugerido:** Cambiar `id` por `id_aprobacion` en el controller de Aprobaciones.

---

## Credenciales de prueba

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@raizviva.com | Admin123 |
| Actor territorial | sahara@gmail.com | Admin123 |
| Turista | juan@gmail.com | Admin123 |
| Lider (Buitrera) | lider.buitrera@raizviva.com | Admin123 |

---

## Resumen de endpoints

| # | Metodo | URL | Auth | Descripcion |
|---|--------|-----|------|-------------|
| 1 | GET | `/` | Publica | Health check |
| 2 | POST | `/api/token/` | Publica | Login (obtener JWT) |
| 3 | POST | `/api/token/refresh/` | Publica | Refrescar JWT |
| 4 | GET | `/api/estados/` | Publica | Lista estados |
| 5 | GET | `/api/monedas/` | Publica | Lista monedas |
| 6 | GET | `/api/territorios/` | Publica | Lista territorios |
| 7 | GET | `/api/tipos-actores/` | Publica | Lista tipos de actores |
| 8 | GET | `/api/servicios/` | Publica | Lista servicios |
| 9 | GET | `/api/clientes/` | Publica | Lista todos los clientes |
| 10 | GET | `/api/clientes/{id}/` | Publica | Detalle de cliente |
| 11 | GET | `/api/clientes/{id}/servicios/` | Publica | Servicios de un cliente |
| 12 | POST | `/api/clientes/{id}/servicios/` | Publica | Agregar servicio a cliente |
| 13 | DELETE | `/api/clientes/{id}/servicios/` | Publica | Eliminar servicio de cliente |
| 14 | GET | `/api/categorias-eventos/` | Publica | Lista categorias de eventos |
| 15 | GET | `/api/categorias-eventos/{id}/` | Publica | Detalle de categoria |
| 16 | GET | `/api/eventos/` | Publica | Lista eventos |
| 17 | GET | `/api/eventos/{id}/` | Publica | Detalle de evento |
| 18 | POST | `/api/eventos/` | Publica | Crear evento |
| 19 | PUT | `/api/eventos/{id}/` | Publica | Actualizar evento |
| 20 | PATCH | `/api/eventos/{id}/` | Publica | Cambiar estado de evento |
| 21 | GET | `/api/ecoaventuras/` | Publica | Lista eco-aventuras (con filtros) |
| 22 | GET | `/api/ecoaventuras/admin/` | Publica | Lista todas (admin panel) |
| 23 | GET | `/api/ecoaventuras/{id}/` | Publica | Detalle de eco-aventura |
| 24 | POST | `/api/ecoaventuras/` | Publica | Crear eco-aventura |
| 25 | PUT | `/api/ecoaventuras/{id}/` | Publica | Actualizar eco-aventura |
| 26 | PATCH | `/api/ecoaventuras/{id}/` | Publica | Toggle activo / update parcial |
| 27 | GET | `/api/ecoaventuras/{id}/itinerario/` | Publica | Itinerario de eco-aventura |
| 28 | POST | `/api/ecoaventuras/{id}/itinerario/` | Publica | Crear/actualizar itinerario |
| 29 | GET | `/api/comentarios/` | Publica | Lista comentarios |
| 30 | GET | `/api/comentarios/tendencias/` | Publica | Metricas de comentarios |
| 31 | GET | `/api/comentarios/{id}/` | Publica | Detalle de comentario |
| 32 | POST | `/api/comentarios/` | Publica | Crear comentario |
| 33 | PATCH | `/api/comentarios/{id}/` | Publica | Actualizar comentario |
| 34 | DELETE | `/api/comentarios/{id}/` | Publica | Eliminar comentario |
| 35 | GET | `/api/growth/` | Publica | Metricas Growth (**BUG**) |
| 36 | GET | `/api/paquete/` | Session | Ver paquete actual |
| 37 | POST | `/api/paquete/agregar/` | Session | Agregar item al paquete |
| 38 | DELETE | `/api/paquete/` | Session | Vaciar paquete |
| 39 | DELETE | `/api/paquete/items/{id}/` | Session | Eliminar item del paquete |
| 40 | POST | `/api/registro/cliente/` | Publica | Registrar nuevo usuario |
| 41 | GET | `/api/auth/me/` | JWT | Perfil del usuario autenticado |
| 42 | PATCH | `/api/perfil/actualizar/` | JWT | Actualizar perfil |
| 43 | GET | `/api/perfil/servicios/` | JWT | Servicios del usuario |
| 44 | POST | `/api/perfil/servicios/` | JWT | Agregar servicio al perfil |
| 45 | PATCH | `/api/perfil/servicios/{id}/` | JWT | Actualizar servicio del perfil |
| 46 | DELETE | `/api/perfil/servicios/{id}/` | JWT | Eliminar servicio del perfil |
| 47 | GET | `/api/solicitudes/` | JWT+Lider | Solicitudes de aprobacion |
| 48 | GET | `/api/solicitudes/{id}/` | JWT+Lider | Detalle de solicitud |
| 49 | PATCH | `/api/solicitudes/{id}/actualizar/` | JWT+Lider | Aprobar/rechazar solicitud |
| 50 | GET | `/api/lider/dashboard/` | JWT+Lider | Dashboard del lider (**BUG**) |
| 51 | GET | `/api/lider/actores/` | JWT+Lider | Actores del lider |
| 52 | PATCH | `/api/lider/actores/{id}/toggle-estado/` | JWT+Lider | Habilitar/deshabilitar actor |
| 53 | GET | `/api/admin/territorios/` | JWT+Admin | Lista territorios (admin) |
| 54 | GET | `/api/admin/territorios/{id}/` | JWT+Admin | Detalle territorio (admin) |
| 55 | POST | `/api/admin/territorios/` | JWT+Admin | Crear territorio |
| 56 | PATCH | `/api/admin/territorios/{id}/` | JWT+Admin | Actualizar territorio |
| 57 | GET | `/api/admin/lideres/` | JWT+Admin | Lista lideres (admin) |
| 58 | GET | `/api/admin/lideres/{id}/` | JWT+Admin | Detalle lider (admin) |
| 59 | PATCH | `/api/admin/lideres/{id}/` | JWT+Admin | Actualizar lider |
| 60 | POST | `/api/usuarios/admin/registrar-lider/` | JWT+Admin | Registrar nuevo lider |

---

## Apps sin endpoints (modelos solos)

Las siguientes apps estan en `INSTALLED_APPS` pero NO exponen endpoints HTTP:

| App | Contenido |
|-----|-----------|
| Estados | Modelo + Controller + Service (logica accesible via `/api/estados/` de usuarios) |
| Monedas | Modelo + Controller + Service (logica accesible via `/api/monedas/` de usuarios) |
| Territorio | Solo modelo |
| TiposActores | Modelo + Controller + Service (logica accesible via `/api/tipos-actores/` de usuarios) |
| Categorias | Modelo + Controller + Service (no expuesta) |
| Productos | Modelo + Controller + Service (solo como nested en Eventos) |
| Usuario | Solo modelo |
| DetallesEventos | Modelo + Controller + Service (solo como nested en Eventos) |
| Evento | Modelo legacy (no usado) |
| Experiencia | Solo modelo |
| ConsolidadoEvento | Solo modelo (causa bug en Growth) |
| ConsolidadoExperiencia | Solo modelo |
| DetalleEvento | Solo modelo (separate from DetallesEventos) |

---

> **Nota:** Este documento fue generado el 14 de junio de 2026. Los endpoints pueden cambiar a medida que se desarrollan nuevas funcionalidades. Consultar los archivos `urls.py` y `*Controller.py` de cada app para la informacion mas actualizada.
