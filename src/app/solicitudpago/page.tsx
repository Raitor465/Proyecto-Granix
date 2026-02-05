"use client"

import React from "react"

import { useEffect, useState, useRef } from "react"
import { setUpDataBase } from "@/lib/indexedDB"
import { useCarrito } from "@/lib/carritoContext"
// import type { Cliente, Deuda } from "@/lib/types"  

export type Deuda = {
  id: number;
  tipo: string;
  operacion: number;
  importe: number;
  fechaVencimiento: string;
  filial: number;
  vendedor: number;
  estado_pago?: 'pendiente' | 'pagado' | 'comprobante_pendiente';  
}

export type Cliente = {
  CODCL: number           // <-- ID real del cliente en tu BD
  nombre: string
  Direccion: {            // <-- Objeto con calle y numero
    calle: string
    numero: string
  }
  deudas: Deuda[]
}

import {
  ArrowLeft,
  FileText,
  Calendar,
  Upload,
  X,
  CheckCircle2,
  ImageIcon,
  FileIcon,
  AlertCircle,
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

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) {
    return <ImageIcon className="h-5 w-5" />
  }
  return <FileIcon className="h-5 w-5" />
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* =======================
   TIPOS
======================= */

type UploadedFile = {
  file: File
  preview: string | null
  arrayBuffer: ArrayBuffer  // <-- Necesario para guardar en IndexedDB
}

/* =======================
   COMPONENTES
======================= */

function DeudaSelectionCard({
  deuda,
  isSelected,
  onSelect,
}: {
  deuda: Deuda
  isSelected: boolean
  onSelect: () => void
}) {
  const status = getVencimientoStatus(deuda.fechaVencimiento)

  // Si tiene comprobante pendiente (ya enviado a Supabase, esperando aprobación)
  // Si tiene comprobante pendiente (estado_pago viene de IndexedDB)
  if (deuda.estado_pago === 'comprobante_pendiente') {
    return (
      <div className="w-full text-left rounded-xl border-2 border-purple-200 bg-purple-50 opacity-75 cursor-not-allowed">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-purple-400 bg-purple-100 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold text-purple-900">{deuda.tipo}</span>
                </div>
                <p className="text-sm text-purple-700">Op. #{deuda.operacion}</p>
              </div>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-purple-200 text-purple-800 border-purple-300">
              Pago en Revisión
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-200">
            <div className="flex items-center gap-2 text-sm text-purple-700">
              <Calendar className="h-4 w-4" />
              {formatDate(deuda.fechaVencimiento)}
            </div>
            <span className="text-lg font-bold text-purple-900">
              {formatCurrency(deuda.importe)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Si ya está pagada (aprobada)
  if (deuda.estado_pago === 'pagado') {
    return (
      <div className="w-full text-left rounded-xl border-2 border-emerald-200 bg-emerald-50 opacity-75 cursor-not-allowed">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-emerald-400 bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-900">{deuda.tipo}</span>
                </div>
                <p className="text-sm text-emerald-700">Op. #{deuda.operacion}</p>
              </div>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-emerald-200 text-emerald-800 border-emerald-300">
              Pagado
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-200">
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <Calendar className="h-4 w-4" />
              {formatDate(deuda.fechaVencimiento)}
            </div>
            <span className="text-lg font-bold text-emerald-900">
              {formatCurrency(deuda.importe)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Deuda disponible para pagar (estado_pago = 'pendiente' o null)
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl border-2 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-300 bg-white"
              }`}
            >
              {isSelected && (
                <CheckCircle2 className="h-4 w-4 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="font-semibold text-gray-900">{deuda.tipo}</span>
              </div>
              <p className="text-sm text-gray-500">Op. #{deuda.operacion}</p>
            </div>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.className}`}>
            {status.label}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            {formatDate(deuda.fechaVencimiento)}
          </div>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(deuda.importe)}
          </span>
        </div>
      </div>
    </button>
  )
}
function FileUploader({
  uploadedFile,
  onFileSelect,
  onFileRemove,
}: {
  uploadedFile: UploadedFile | null
  onFileSelect: (file: File) => void
  onFileRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const acceptedTypes = ".pdf,.jpg,.jpeg,.png,.webp"

  if (uploadedFile) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-start gap-4">
          {uploadedFile.preview ? (
            <img
              src={uploadedFile.preview || "/placeholder.svg"}
              alt="Vista previa"
              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
              <FileIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {uploadedFile.file.name}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatFileSize(uploadedFile.file.size)}
            </p>
            <div className="flex items-center gap-2 mt-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Archivo listo para enviar
            </div>
          </div>
          <button
            type="button"
            onClick={onFileRemove}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed transition-colors ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 bg-gray-50 hover:border-gray-400"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="p-8 text-center">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Upload className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-700">
          Arrastra tu comprobante aquí
        </p>
        <p className="text-sm text-gray-500 mt-1">
          o haz clic para seleccionar
        </p>
        <p className="text-xs text-gray-400 mt-3">
          PDF, JPG, PNG o WEBP (máx. 10MB)
        </p>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-20" />
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-6 bg-gray-200 rounded w-28" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 min-h-[300px] p-8 text-center">
      <div className="bg-emerald-100 p-4 rounded-full mb-4">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Sin facturas pendientes
      </h3>
      <p className="text-sm text-gray-500 max-w-xs">
        No hay facturas disponibles para pagar. Todas las cuentas se encuentran al día.
      </p>
    </div>
  )
}

/* =======================
   PAGE
======================= */

export default function PagoPage() {
  const { agregarItem, carrito } = useCarrito()
  const [deudas, setDeudas] = useState<Deuda[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDeuda, setSelectedDeuda] = useState<Deuda | null>(null)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

    useEffect(() => {
    const loadDeudas = async () => {
      setIsLoading(true)
      try {
        const db = await setUpDataBase()
        const tx = db.transaction("ClienteSucursal", "readonly")
        const clientes = (await tx.store.getAll()) as Cliente[]

        const deudasCliente = clientes[0]?.deudas ?? []
        
        // Verificar qué deudas ya están en el carrito
        const deudasConEstado = deudasCliente.map(deuda => {
          const enCarrito = carrito.some(
            (item: any) => item.tipo === 'comprobante_pago' && item.deuda_id === deuda.id
          )
          return {
            ...deuda,
            estado: enCarrito ? 'pendiente_carrito' as const : 'disponible' as const
          }
        })
        
        setDeudas(deudasConEstado)

        await tx.done
      } catch (error) {
        console.error("Error cargando deudas", error)
        setDeudas([])
      } finally {
        setIsLoading(false)
      }
    }

    loadDeudas()
  }, [carrito]) // <-- Agregar carrito como dependencia

    const handleFileSelect = async (file: File) => {  // <-- async
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert("El archivo es demasiado grande. El tamaño máximo es 10MB.")
      return
    }

    let preview: string | null = null
    if (file.type.startsWith("image/")) {
      preview = URL.createObjectURL(file)
    }

    const arrayBuffer = await file.arrayBuffer()  // <-- Obtener el binario
    setUploadedFile({ file, preview, arrayBuffer })  // <-- Guardar arrayBuffer
  }

  const handleFileRemove = () => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview)
    }
    setUploadedFile(null)
  }

    const handleSubmit = async () => {
    if (!selectedDeuda || !uploadedFile) return

    setIsSubmitting(true)

    try {
      // Obtener el cliente actual de IndexedDB
      const db = await setUpDataBase()
      const tx = db.transaction("ClienteSucursal", "readonly")
      const clientes = await tx.objectStore("ClienteSucursal").getAll()
      const cliente = clientes[0] as Cliente

      if (!cliente) {
        alert("No se encontró el cliente")
        setIsSubmitting(false)
        return
      }

      // Crear el item para el carrito
      const nuevoPago = {
        tipo: 'comprobante_pago' as const,
        cliente_id: cliente.CODCL,
        cliente_nombre: cliente.nombre,
        deuda_id: selectedDeuda.id,
        operacion: selectedDeuda.operacion,
        tipo_factura: selectedDeuda.tipo,
        importe: selectedDeuda.importe,
        fecha_vencimiento: selectedDeuda.fechaVencimiento,
        filial: selectedDeuda.filial,
        vendedor: selectedDeuda.vendedor,
        archivo_data: uploadedFile.arrayBuffer,
        archivo_nombre: uploadedFile.file.name,
        archivo_tipo: uploadedFile.file.type,
        archivo_size: uploadedFile.file.size,
        fecha: new Date().toISOString(),
        sincronizado: false
      }

      // Agregar al carrito
      await agregarItem(nuevoPago)

      // Limpiar y mostrar éxito
      setSelectedDeuda(null)
      handleFileRemove()
      setSubmitSuccess(true)
      
    } catch (error) {
      console.error("Error al agregar al carrito:", error)
      alert("Error al guardar el pago. Intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    window.location.href = "/solicitudpago"
  }
  const botonVolverMenu = () => {
    window.location.href = "/rutavisita"
  }

  const canSubmit = selectedDeuda !== null && uploadedFile !== null && !isSubmitting

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 max-w-md w-full p-8 text-center">
          <div className="bg-emerald-100 p-4 rounded-full w-fit mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
            ¡Agregado al carrito!
          </h2>
          <p className="text-gray-500 mb-6">
            El comprobante de pago se guardó en el carrito. 
            Sincronizá todos los cambios desde el menú principal.
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl p-4 space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={botonVolverMenu}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Pagar Factura</h1>
            <p className="text-sm text-gray-500">Selecciona una factura y sube tu comprobante</p>
          </div>
        </div>

        {/* PASO 1: SELECCIONAR FACTURA */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <h2 className="font-semibold text-gray-900">Selecciona la factura a pagar</h2>
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : deudas.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {deudas.map((deuda, index) => (
                <DeudaSelectionCard
                  key={`${deuda.operacion}-${index}`}
                  deuda={deuda}
                  isSelected={selectedDeuda?.operacion === deuda.operacion}
                  onSelect={() => setSelectedDeuda(deuda)}
                />
              ))}
            </div>
          )}
        </div>

        {/* PASO 2: SUBIR COMPROBANTE */}
        {deudas.length > 0 && (
          <div className={selectedDeuda ? "opacity-100" : "opacity-50 pointer-events-none"}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                  selectedDeuda
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <h2 className="font-semibold text-gray-900">Sube tu comprobante de pago</h2>
            </div>

            <FileUploader
              uploadedFile={uploadedFile}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
            />
          </div>
        )}

        {/* RESUMEN Y ENVIAR */}
        {selectedDeuda && uploadedFile && (
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">Resumen del pago</p>
                <p className="text-sm text-blue-700 mt-1">
                  Factura: {selectedDeuda.tipo} - Op. #{selectedDeuda.operacion}
                </p>
                <p className="text-sm text-blue-700">
                  Importe: {formatCurrency(selectedDeuda.importe)}
                </p>
                <p className="text-sm text-blue-700">
                  Comprobante: {uploadedFile.file.name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BOTÓN ENVIAR */}
        {deudas.length > 0 && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              canSubmit
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
                          <>
                <Upload className="h-5 w-5" />
                Agregar al carrito
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
