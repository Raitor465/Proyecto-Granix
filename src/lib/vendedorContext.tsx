// // VendedorContext.tsx
// import React, { createContext, useContext, useState, ReactNode } from 'react';

// interface VendedorContextType {
//   vendedorId: number | null;
//   setVendedorId: (id: number) => void;
// }

// const VendedorContext = createContext<VendedorContextType | undefined>(undefined);

// export const VendedorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [vendedorId, setVendedorId] = useState<number | null>(null);

//   return (
//     <VendedorContext.Provider value={{ vendedorId, setVendedorId }}>
//       {children}
//     </VendedorContext.Provider>
//   );
// };

// export const useVendedor = (): VendedorContextType => {
//   const context = useContext(VendedorContext);
//   if (!context) {
//     throw new Error("useVendedor debe usarse dentro de un VendedorProvider");
//   }
//   return context;
// };
