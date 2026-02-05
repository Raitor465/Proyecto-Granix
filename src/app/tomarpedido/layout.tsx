// src/app/tomarpedido/layout.tsx
export default function TomarPedidoLayout({ children }: { children: React.ReactNode }) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-center">Cargar Pedido</h1>
        <div>{children}</div>
      </div>
    );
  }