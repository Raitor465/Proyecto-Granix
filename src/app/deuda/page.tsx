"use client"

import { useEffect, useState } from "react"
import { setUpDataBase } from "@/lib/indexedDB"
// import type { Cliente, Deuda } from "@/lib/types"
export type Deuda = {
  tipo: string
  operacion: number
  importe: number
  fechaVencimiento: string
  filial: number
  vendedor: number
}

export type Cliente = {
  id?: number
  nombre: string
  direccion: string
  telefono: string
  deudas: Deuda[]
}
import {
  LogOut,
  FileText,
  Calendar,
  Building2,
  User,
  DollarSign,
  CheckCircle2,
} from "lucide-react"

/* =======================
   HELPERS
======================= */

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getVencimientoStatus(fechaVencimiento: string) {
  const today = new Date()
  const vencimiento = new Date(fechaVencimiento)
  const diffDays = Math.ceil(
    (vencimiento.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays < 0) {
    return { label: "Vencido", className: "bg-red-100 text-red-700 border-red-200" }
  } else if (diffDays <= 7) {
    return { label: "Por vencer", className: "bg-amber-100 text-amber-700 border-amber-200" }
  }

  return { label: "Vigente", className: "bg-emerald-100 text-emerald-700 border-emerald-200" }
}

/* =======================
   COMPONENTES
======================= */

function DebtCard({ deuda }: { deuda: Deuda }) {
  const status = getVencimientoStatus(deuda.fechaVencimiento)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <span className="font-semibold text-gray-900">{deuda.tipo}</span>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.className}`}>
            {status.label}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Op. #{deuda.operacion}
        </p>
      </div>

      <div className="px-4 pb-4 space-y-3">
        <div className="text-2xl font-bold text-gray-900">
          {formatCurrency(deuda.importe)}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            {formatDate(deuda.fechaVencimiento)}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Building2 className="h-4 w-4" />
            Filial {deuda.filial}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 col-span-2">
            <User className="h-4 w-4" />
            Vendedor #{deuda.vendedor}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyDebtState() {
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 min-h-[300px] p-8 text-center">
      <div className="bg-emerald-100 p-4 rounded-full mb-4">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Sin deudas pendientes
      </h3>
      <p className="text-sm text-gray-500 max-w-xs">
        Este cliente no tiene deudas registradas. Todas las cuentas se encuentran al día.
      </p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="flex justify-between mb-4">
            <div className="h-5 bg-gray-200 rounded w-32" />
            <div className="h-6 bg-gray-200 rounded-full w-20" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-40 mb-4" />
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* =======================
   PAGE
======================= */

export default function DeudaPage() {
  const [deudas, setDeudas] = useState<Deuda[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDeudas = async () => {
      setIsLoading(true)
      try {
        const db = await setUpDataBase()
        const tx = db.transaction("ClienteSucursal", "readonly")
        const clientes = (await tx.store.getAll()) as Cliente[]

        const deudasCliente = clientes[0]?.deudas ?? []
        setDeudas(deudasCliente)

        await tx.done
      } catch (error) {
        console.error("Error cargando deudas", error)
        setDeudas([])
      } finally {
        setIsLoading(false)
      }
    }

    loadDeudas()
  }, [])

  const totalDeuda = deudas.reduce((total, deuda) => total + deuda.importe, 0)

  const handleNavigation = () => {
    window.location.href = "/rutavisita"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl p-4 space-y-6">
        {/* TOTAL */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100">
                  Deuda Total del Cliente
                </p>
                <p className="text-3xl font-bold mt-1">
                  {isLoading ? "..." : formatCurrency(totalDeuda)}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <DollarSign className="h-8 w-8" />
              </div>
            </div>

            {!isLoading && deudas.length > 0 && (
              <p className="text-sm text-blue-200 mt-2">
                {deudas.length}{" "}
                {deudas.length === 1 ? "documento pendiente" : "documentos pendientes"}
              </p>
            )}
          </div>
        </div>

        {/* LISTA */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : deudas.length === 0 ? (
          <EmptyDebtState />
        ) : (
          <div className="space-y-4">
            {deudas.map((deuda, index) => (
              <DebtCard key={`${deuda.operacion}-${index}`} deuda={deuda} />
            ))}
          </div>
        )}

        {/* VOLVER */}
        <button
          type="button"
          onClick={handleNavigation}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Volver
        </button>
      </div>
    </div>
  )
}