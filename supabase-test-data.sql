-- ============================================
-- DATOS DE PRUEBA PARA TESTING
-- Proyecto Granix
-- ============================================

-- Insertar algunos clientes de prueba
INSERT INTO clientes (id, nombre, telefono, email, notas, latitud, longitud, orden_visita) VALUES
(12, 'Sucursal Norteño', '555-0001', 'norteno@example.com', 'Cliente preferencial', -29.6823238547196, -80.9114435186036, 1),
(13, 'Oficina Sur', '555-0002', 'sur@example.com', 'Pedidos mensuales', -29.7000000000000, -80.9500000000000, 2),
(14, 'Centro Comercial', '555-0003', 'centro@example.com', 'Entregas urgentes', -29.6500000000000, -80.9200000000000, 3)
ON CONFLICT (id) DO NOTHING;

-- Mensaje de confirmación
SELECT 'Clientes de prueba insertados correctamente' AS mensaje;
