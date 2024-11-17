// src/app/actualizardatos/layout.tsx
export default function actualizarLayout({ children }: { children: React.ReactNode }) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-center">Actualizar Datos</h1>
        <div>{children}</div>
      </div>
    );
  }