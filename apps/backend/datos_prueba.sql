-- =============================================
-- RAÍZ VIVA - Script de Datos de Prueba (Corregido)
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
('Semilla', '🌱'),
('Moneda Local', 'ML'),
('Puntos', 'PT');

-- =============================================
-- 3. TIPOS DE ACTORES
-- =============================================
INSERT INTO tipos_actores (nombre_tipo, descripcion) VALUES
('turista', 'Visitante de experiencias'),
('productor', 'Suministro de productos locales y artesanales'),
('caminante', 'Guía de rutas e intérprete de saberes'),
('custodio', 'Protección de biodiversidad y patrimonio'),
('facilitador', 'Tallerista y gestor de experiencias'),
('anfitrión', 'Gestor de alojamiento, gastronomía y transporte');

-- =============================================
-- 4. USUARIOS DE LÍDERES (auth_user)
-- =============================================
INSERT INTO auth_user (username, email, first_name, last_name, password, is_superuser, is_staff, is_active, date_joined) VALUES
('lider_buitrera', 'lider.buitrera@raizviva.com', 'María', 'López', 'pbkdf2_sha256$870000$placeholder1$placeholderhash1', FALSE, TRUE, TRUE, NOW()),
('lider_purace', 'lider.purace@raizviva.com', 'Carlos', 'González', 'pbkdf2_sha256$870000$placeholder2$placeholderhash2', FALSE, TRUE, TRUE, NOW());

-- =============================================
-- 5. CLIENTES LÍDERES
-- =============================================
INSERT INTO clientes (id_usuario, id_estado, id_tipo_moneda, nombre, telefono, reputacion, es_actor, es_lider, es_turista) VALUES
(1, 1, 1, 'María López', '3001234567', 95.00, FALSE, TRUE, FALSE),
(2, 2, 1, 'Carlos González', '3007654321', 90.00, FALSE, TRUE, FALSE);

-- =============================================
-- 6. TERRITORIOS (con líder asignado)
-- =============================================
INSERT INTO territorios (id_estado, id_administrador, nombre_territorio, region) VALUES
(1, 1, 'Buitrera', 'Zona Rural Palmira'),
(1, 1, 'La Torre', 'Zona Urbana Palmira'),
(1, 1, 'Amaime', 'Zona Rural Palmira'),
(2, 2, 'Puracé', 'Cauca'),
(2, 2, 'Popayán', 'Cauca'),
(3, 2, 'Pasto', 'Nariño');

-- =============================================
-- 7. USUARIOS DE ACTORES TERRITORIALES (auth_user)
-- =============================================
INSERT INTO auth_user (username, email, first_name, last_name, password, is_superuser, is_staff, is_active, date_joined) VALUES
('productor_amaime', 'productor.amaime@raizviva.com', 'Juan', 'Martínez', 'pbkdf2_sha256$870000$placeholder3$placeholderhash3', FALSE, FALSE, TRUE, NOW()),
('caminante_palmira', 'caminante.palmira@raizviva.com', 'Ana', 'Rodríguez', 'pbkdf2_sha256$870000$placeholder4$placeholderhash4', FALSE, FALSE, TRUE, NOW()),
('anfitrion_buitrera', 'anfitrion.buitrera@raizviva.com', 'Pedro', 'Sánchez', 'pbkdf2_sha256$870000$placeholder5$placeholderhash5', FALSE, FALSE, TRUE, NOW()),
('turista_prueba', 'turista@raizviva.com', 'Sofia', 'García', 'pbkdf2_sha256$870000$placeholder6$placeholderhash6', FALSE, FALSE, TRUE, NOW());

-- =============================================
-- 8. CLIENTES ACTORES TERRITORIALES
-- =============================================
INSERT INTO clientes (id_usuario, id_estado, id_tipo_moneda, nombre, telefono, reputacion, es_actor, es_lider, es_turista) VALUES
(3, 1, 2, 'Juan Martínez', '3012345678', NULL, FALSE, FALSE, FALSE),
(4, 1, 1, 'Ana Rodríguez', '3098765432', NULL, FALSE, FALSE, FALSE),
(5, 1, 3, 'Pedro Sánchez', '3101234567', 75.50, TRUE, FALSE, FALSE),
(6, 1, 1, 'Sofia García', '3201234567', NULL, FALSE, FALSE, TRUE);

-- =============================================
-- 9. RELACIÓN CLIENTES-TIPOS ACTORES (ManyToMany)
-- =============================================
INSERT INTO cliente_tipos_actores (id_actor, id_tipo) VALUES (3, 2);
INSERT INTO cliente_tipos_actores (id_actor, id_tipo) VALUES (4, 3);
INSERT INTO cliente_tipos_actores (id_actor, id_tipo) VALUES (5, 6);
INSERT INTO cliente_tipos_actores (id_actor, id_tipo) VALUES (6, 1);

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
-- Líderes: María López (id=1), Carlos González (id=2)
-- Territorios: 6 territorios (3 para María, 3 para Carlos)
-- Actores: Juan Martínez (id=3, EN_REVISION), Ana Rodríguez (id=4, EN_REVISION), Pedro Sánchez (id=5, APROBADO)
-- Turista: Sofia García (id=6)
-- Aprobaciones pendientes: 2 | Aprobadas: 1