import { setUpDataBase } from "./indexedDB";

export const logout = async () => {
    try {
      sessionStorage.setItem("isLoggedIn", "false");
      sessionStorage.removeItem("clientesSincronizados");
      sessionStorage.removeItem("clientesConError");

      const db = await setUpDataBase();
      const tx = db.transaction(["ClienteSucursal", "RutaDeVisita", "RutaDeNoVisita", "Precios","Vendedor"], "readwrite");
      await tx.objectStore("ClienteSucursal").clear();
      await tx.objectStore("RutaDeVisita").clear();
      await tx.objectStore("RutaDeNoVisita").clear();
      await tx.objectStore("Precios").clear();
      await tx.objectStore("Vendedor").clear();
      await tx.done;
      console.log("Session storage cleared and navigating to home");
      
      // Redirigir a la página de login
      window.location.href = '/';
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
