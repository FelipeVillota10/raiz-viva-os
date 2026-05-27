"""-- =============================================
-- RAIZ VIVA - Script de Datos de Prueba
-- =============================================
-- Para ejecutar: psql -U postgres -h localhost -p 5432 -d raizviva_db -f datos_prueba.sql
-- =============================================

-- =============================================
-- 0. LIMPIEZA (TRUNCATE con reinicio de secuencias)
-- =============================================
TRUNCATE TABLE cliente_servicios RESTART IDENTITY CASCADE;
TRUNCATE TABLE aprobaciones RESTART IDENTITY CASCADE;
TRUNCATE TABLE cliente_tipos_actores RESTART IDENTITY CASCADE;
TRUNCATE TABLE territorios RESTART IDENTITY CASCADE;
TRUNCATE TABLE clientes RESTART IDENTITY CASCADE;
TRUNCATE TABLE auth_user RESTART IDENTITY CASCADE;
TRUNCATE TABLE tipos_actores RESTART IDENTITY CASCADE;
TRUNCATE TABLE servicios RESTART IDENTITY CASCADE;
TRUNCATE TABLE monedas RESTART IDENTITY CASCADE;
TRUNCATE TABLE estados RESTART IDENTITY CASCADE;

-- =============================================
-- 1. ESTADOS (para aprobaciones y clientes)
-- =============================================
INSERT INTO estados (nombre_estado) VALUES
('en_revision'),
('rechazado'),
('aceptado'),
('activo'),
('inactivo');

-- =============================================
-- 2. MONEDAS
-- =============================================
INSERT INTO monedas (nombre, simbolo) VALUES
('europea', 'EUR'),
('estadounidense', 'USD'),
('colombiana', 'COP');

-- =============================================
-- 3. TIPOS DE ACTORES
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
(1, 'lider_buitrera', 'lider.buitrera@raizviva.com', 'Maria', 'Lopez', 'pbkdf2_sha256$870000$xNWOZI3duAzk0CyzgRIRnO$fVCyAoxBOqJ6dSZIKZxwBK9fM9tKC9+fZvmaoItFEJg=', FALSE, TRUE, TRUE, NOW()),
(2, 'lider_purace', 'lider.purace@raizviva.com', 'Carlos', 'Gonzalez', 'pbkdf2_sha256$870000$placeholder2$placeholderhash2', FALSE, TRUE, TRUE, NOW());

-- =============================================
-- 5. CLIENTES LIDERES
-- =============================================
INSERT INTO clientes (id_cliente, id_usuario, id_estado, id_tipo_moneda, nombre, telefono, reputacion, es_actor, es_lider, es_turista) VALUES
(1, 1, 4, 1, 'Maria Lopez', '3001234567', 95.00, FALSE, TRUE, FALSE),
(2, 2, 4, 2, 'Carlos Gonzalez', '3007654321', 90.00, FALSE, TRUE, FALSE);

-- =============================================
-- 6. TERRITORIOS (con lider asignado)
-- =============================================
INSERT INTO territorios (id_territorio, id_estado, id_administrador, nombre_territorio, region) VALUES
(1, 4, 1, 'Buitrera', 'Zona Rural Palmira'),
(2, 4, 1, 'La Torre', 'Zona Urbana Palmira'),
(3, 4, 1, 'Amaime', 'Zona Rural Palmira'),
(4, 3, 2, 'Purace', 'Cauca'),
(5, 3, 2, 'Popayan', 'Cauca'),
(6, 3, 2, 'Pasto', 'Narino');

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
(3, 3, 4, 3, 'Juan Martinez', '3012345678', NULL, TRUE, FALSE, FALSE),
(4, 4, 4, 1, 'Ana Rodriguez', '3098765432', NULL, TRUE, FALSE, FALSE),
(5, 5, 4, 3, 'Pedro Sanchez', '3101234567', 75.50, TRUE, FALSE, FALSE),
(6, 6, 4, 1, 'Sofia Garcia', '3201234567', NULL, FALSE, FALSE, TRUE);

-- =============================================
-- 9. RELACION CLIENTES-TIPOS ACTORES (ManyToMany)
-- =============================================
INSERT INTO cliente_tipos_actores (fecha_asignacion, id_actor, id_tipo) VALUES (NOW(), 3, 1);
INSERT INTO cliente_tipos_actores (fecha_asignacion, id_actor, id_tipo) VALUES (NOW(), 4, 2);
INSERT INTO cliente_tipos_actores (fecha_asignacion, id_actor, id_tipo) VALUES (NOW(), 5, 5);
INSERT INTO cliente_tipos_actores (fecha_asignacion, id_actor, id_tipo) VALUES (NOW(), 6, 6);

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
-- 11. SERVICIOS (Catalogo general)
-- =============================================
INSERT INTO servicios (nombre, descripcion, precio_base, unidad) VALUES
('Restaurante', 'Servicio de alimentacion con productos locales', NULL, 'por persona'),
('Hoteleria', 'Alojamiento en casas rurales y hospedajes comunitarios', NULL, 'por noche'),
('Spa', 'Tratamientos naturales con plantas y saberes ancestrales', NULL, 'por sesion'),
('Guia de caminata', 'Recorridos guiados por senderos naturales y culturales', NULL, 'por persona'),
('Artesanias', 'Elaboracion y venta de piezas artesanales locales', NULL, 'por pieza'),
('Transporte', 'Movilidad interna dentro del territorio', NULL, 'por trayecto'),
('Taller gastronomico', 'Talleres de cocina tradicional y productos locales', NULL, 'por persona'),
('Interpretacion cultural', 'Narracion de historias, mitos y saberes del territorio', NULL, 'por grupo'),
('Agricultura', 'Venta directa de productos agricolas organicos', NULL, 'por kilo'),
('Experiencia vivencial', 'Inmersion en la vida cotidiana de la comunidad', NULL, 'por dia');

-- =============================================
-- 12. RELACION ACTORES-SERVICIOS (Un actor puede tener varios servicios)
-- =============================================
-- Juan Martinez (id=3, productor) → Agricultura, Artesanias
INSERT INTO cliente_servicios (id_cliente, id_servicio, precio_acordado) VALUES
(3, 9, 15000.00),
(3, 5, 25000.00);

-- Ana Rodriguez (id=4, caminante) → Guia de caminata, Interpretacion cultural
INSERT INTO cliente_servicios (id_cliente, id_servicio, precio_acordado) VALUES
(4, 4, 35000.00),
(4, 8, 40000.00);

-- Pedro Sanchez (id=5, anfitrion) → Restaurante, Hoteleria, Transporte
INSERT INTO cliente_servicios (id_cliente, id_servicio, precio_acordado) VALUES
(5, 1, 20000.00),
(5, 2, 50000.00),
(5, 6, 10000.00);

-- =============================================
-- RESUMEN
-- =============================================
-- Lideres: Maria Lopez (id=1), Carlos Gonzalez (id=2)
-- Territorios: 6 territorios (3 para Maria, 3 para Carlos)
-- Actores: Juan Martinez (id=3, EN_REVISION), Ana Rodriguez (id=4, EN_REVISION), Pedro Sanchez (id=5, APROBADO)
-- Turista: Sofia Garcia (id=6)
-- Aprobaciones pendientes: 2 | Aprobadas: 1
-- Servicios: 10 en catalogo | 7 relaciones actor-servicio
