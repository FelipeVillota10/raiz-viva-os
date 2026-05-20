-- =============================================
-- RAIZ VIVA - Script de Datos de Prueba
-- =============================================

-- =============================================
-- 1. ESTADOS (Regiones/Departamentos)
-- =============================================
INSERT INTO estados (nombre_estado) VALUES
('Valle del Cauca'),
('Cauca'),
('Nariño'),
('Huila'),
('Cundinamarca');

-- =============================================
-- 2. MONEDAS
-- =============================================
INSERT INTO monedas (nombre, simbolo) VALUES
('Semilla', 'S'),
('Moneda Local', 'ML'),
('Puntos', 'PT');

-- =============================================
-- 3. TIPOS DE ACTORES
-- Los IDs deben coincidir con los que enviara el frontend
-- El icono se determina en el frontend segun el nombre_tipo
-- =============================================
INSERT INTO tipos_actores (id, nombre_tipo, descripcion) VALUES
(1, 'productor', 'Suministro de productos locales y artesanales'),
(2, 'caminante', 'Guia de rutas e interprete de saberes'),
(3, 'custodio', 'Proteccion de biodiversidad y patrimonio'),
(4, 'facilitador', 'Tallerista y gestor de experiencias'),
(5, 'anfitrion', 'Gestor de alojamiento, gastronomia y transporte'),
(6, 'turista', 'Visitante de experiencias');

-- =============================================
-- 4. USUARIOS DE LIDERES (auth_user)
-- =============================================
INSERT INTO auth_user (id, username, email, first_name, last_name, password, is_superuser, is_staff, is_active, date_joined) VALUES
(1, 'lider_buitrera', 'lider.buitrera@raizviva.com', 'Maria', 'Lopez', 'pbkdf2_sha256$870000$placeholder1$placeholderhash1', FALSE, TRUE, TRUE, NOW()),
(2, 'lider_purace', 'lider.purace@raizviva.com', 'Carlos', 'Gonzalez', 'pbkdf2_sha256$870000$placeholder2$placeholderhash2', FALSE, TRUE, TRUE, NOW());

-- =============================================
-- 5. CLIENTES LIDERES
-- =============================================
INSERT INTO clientes (id_cliente, id_usuario, id_estado, id_tipo_moneda, nombre, telefono, reputacion, es_actor, es_lider, es_turista) VALUES
(1, 1, 1, 1, 'Maria Lopez', '3001234567', 95.00, FALSE, TRUE, FALSE),
(2, 2, 2, 1, 'Carlos Gonzalez', '3007654321', 90.00, FALSE, TRUE, FALSE);

-- =============================================
-- 6. TERRITORIOS (con lider asignado)
-- =============================================
INSERT INTO territorios (id_territorio, id_estado, id_administrador, nombre_territorio, region) VALUES
(1, 1, 1, 'Buitrera', 'Zona Rural Palmira'),
(2, 1, 1, 'La Torre', 'Zona Urbana Palmira'),
(3, 1, 1, 'Amaime', 'Zona Rural Palmira'),
(4, 2, 2, 'Purace', 'Cauca'),
(5, 2, 2, 'Popayan', 'Cauca'),
(6, 3, 2, 'Pasto', 'Nariño');

-- =============================================
-- 7. USUARIOS DE ACTORES TERRITORIALES (auth_user)
-- =============================================
INSERT INTO auth_user (id, username, email, first_name, last_name, password, is_superuser, is_staff, is_active, date_joined) VALUES
(3, 'productor_amaime', 'productor.amaime@raizviva.com', 'Juan', 'Martinez', 'pbkdf2_sha256$870000$placeholder3$placeholderhash3', FALSE, FALSE, TRUE, NOW()),
(4, 'caminante_palmira', 'caminante.palmira@raizviva.com', 'Ana', 'Rodriguez', 'pbkdf2_sha256$870000$placeholder4$placeholderhash4', FALSE, FALSE, TRUE, NOW()),
(5, 'anfitrion_buitrera', 'anfitrion.buitrera@raizviva.com', 'Pedro', 'Sanchez', 'pbkdf2_sha256$870000$placeholder5$placeholderhash5', FALSE, FALSE, TRUE, NOW()),
(6, 'turista_prueba', 'turista@raizviva.com', 'Sofia', 'Garcia', 'pbkdf2_sha256$870000$placeholder6$placeholderhash6', FALSE, FALSE, TRUE, NOW());

-- =============================================
-- 8. CLIENTES ACTORES TERRITORIALES
-- =============================================
INSERT INTO clientes (id_cliente, id_usuario, id_estado, id_tipo_moneda, nombre, telefono, reputacion, es_actor, es_lider, es_turista) VALUES
(3, 3, 1, 2, 'Juan Martinez', '3012345678', NULL, TRUE, FALSE, FALSE),
(4, 4, 1, 1, 'Ana Rodriguez', '3098765432', NULL, TRUE, FALSE, FALSE),
(5, 5, 1, 3, 'Pedro Sanchez', '3101234567', 75.50, TRUE, FALSE, FALSE),
(6, 6, 1, 1, 'Sofia Garcia', '3201234567', NULL, FALSE, FALSE, TRUE);

-- =============================================
-- 9. RELACION CLIENTES-TIPOS ACTORES (ManyToMany)
-- =============================================
INSERT INTO cliente_tipos_actores (id_actor, id_tipo) VALUES (3, 1);
INSERT INTO cliente_tipos_actores (id_actor, id_tipo) VALUES (4, 2);
INSERT INTO cliente_tipos_actores (id_actor, id_tipo) VALUES (5, 5);
INSERT INTO cliente_tipos_actores (id_actor, id_tipo) VALUES (6, 6);

-- =============================================
-- 10. APROBACIONES
-- =============================================
INSERT INTO aprobaciones (id_actor, id_lider, estado_resultado, observaciones, fecha_solicitud) VALUES
(3, 1, 'EN_REVISION', NULL, NOW() - INTERVAL '2 days');

INSERT INTO aprobaciones (id_actor, id_lider, estado_resultado, observaciones, fecha_solicitud) VALUES
(4, 1, 'EN_REVISION', NULL, NOW() - INTERVAL '1 day');

INSERT INTO aprobaciones (id_actor, id_lider, estado_resultado, observaciones, fecha_solicitud, fecha_respuesta) VALUES
(5, 1, 'APROBADO', 'Bienvenido al equipo. Territorio Buitrera necesita anfitriones.', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days');

-- =============================================
-- RESUMEN
-- =============================================
-- Lideres: Maria Lopez (id=1), Carlos Gonzalez (id=2)
-- Territorios: 6 territorios (3 para Maria, 3 para Carlos)
-- Actores: Juan Martinez (id=3, EN_REVISION), Ana Rodriguez (id=4, EN_REVISION), Pedro Sanchez (id=5, APROBADO)
-- Turista: Sofia Garcia (id=6)
-- Aprobaciones pendientes: 2 | Aprobadas: 1