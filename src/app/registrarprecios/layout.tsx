// src/app/registrarprecios/layout.tsx
export default function RegistrarPreciosLayout({ children }: { children: React.ReactNode }) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-center">Registrar Precios</h1>
        <div>{children}</div>
      </div>
    );
  }