-- ============================================
-- SCRIPT DE CREACIÓN DE TABLAS FALTANTES PARA SUPABASE
-- Proyecto Granix
-- ============================================
-- NOTA: Solo crea las tablas que NO existen en tu base de datos
-- Tablas existentes: ClienteSucursal, ubicacion, precios_clientes, Deudas

-- ==================== CREAR TABLA PEDIDOS ====================
-- Tabla de Pedidos (NO EXISTE - CREAR)
CREATE TABLE IF NOT EXISTS pedidos (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    items JSONB NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== CREAR TABLA COMPROBANTES_PAGO ====================
-- Tabla de Comprobantes de Pago (NO EXISTE - CREAR)
CREATE TABLE IF NOT EXISTS comprobantes_pago (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    deuda_id BIGINT,
    archivo_nombre VARCHAR(255),
    archivo_url TEXT,
    fecha TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== ÍNDICES ====================
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha);
CREATE INDEX IF NOT EXISTS idx_comprobantes_pago_cliente_id ON comprobantes_pago(cliente_id);

-- ==================== POLÍTICAS RLS ====================
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprobantes_pago ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo (PERMITIR TODO)
CREATE POLICY "Enable all operations" ON pedidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations" ON comprobantes_pago FOR ALL USING (true) WITH CHECK (true);

-- ==================== COMENTARIOS ====================
COMMENT ON TABLE pedidos IS 'Pedidos realizados por los clientes';
COMMENT ON TABLE comprobantes_pago IS 'Comprobantes de pago subidos por clientes';

-- ==================== VERIFICACIÓN ====================
-- Ejecuta esto después para verificar que las tablas se crearon correctamente:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('pedidos', 'comprobantes_pago');
