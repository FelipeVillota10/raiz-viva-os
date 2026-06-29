'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { use, useState, useEffect, useCallback } from 'react'
import { consultarRespuesta, descargarComprobante } from '@/services/pago.service'
import { obtenerEvento } from '@/services/pago-evento.service'
import type { PagoRespuesta } from '@/models/pago'
import type { Event } from '@/models/event.model'
import { FondoDecorado } from '@/components/layouts/PagosFondoDecorado'
import { formatearFecha } from '@/utils/fecha'

type EstadoVisual = {
  icono: string
  titulo: string
  colorTxt: string
  colorBorde: string
}

function getEstadoVisual(estado: number, mpStatus?: string): EstadoVisual {
  const s = mpStatus || ''
  if (estado === 2 || s === 'approved') {
    return { icono: '✓', titulo: '¡Pago Exitoso!', colorTxt: 'text-green-700', colorBorde: 'border-green-500' }
  }
  if (estado === 3 || s === 'rejected') {
    return { icono: '✗', titulo: 'Pago Declinado', colorTxt: 'text-red-700', colorBorde: 'border-red-500' }
  }
  if (estado === 4 || s === 'cancelled' || s === 'expired') {
    return { icono: '◷', titulo: 'Pago Expirado', colorTxt: 'text-gray-600', colorBorde: 'border-gray-400' }
  }
  return { icono: '⏳', titulo: 'Pago Pendiente', colorTxt: 'text-yellow-700', colorBorde: 'border-yellow-500' }
}

export default function ConfirmacionPagoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()

  const [pago, setPago] = useState<PagoRespuesta | null>(null)
  const [evento, setEvento] = useState<Event | null>(null)
  const [consolidado, setConsolidado] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const referencia = searchParams.get('external_reference')
    const mpStatus = searchParams.get('status') || undefined
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    if (!referencia) {
      setError('No se recibio referencia de pago')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    let pagoConStatus: any = null

    consultarRespuesta(referencia)
      .then((pagoData) => {
        pagoConStatus = { ...pagoData, mp_status: mpStatus || pagoData.mp_status }
        return fetch(`${API_BASE}/api/consolidado_eventos/${id}/`)
      })
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar la información de la reserva")
        return res.json()
      })
      .then((consolidadoData) => {
        setConsolidado(consolidadoData)
        return obtenerEvento(Number(consolidadoData.evento))
      })
      .then((eventoData) => {
        setPago(pagoConStatus)
        setEvento(eventoData)
      })
      .catch((e: any) => setError(e.message || 'Error al cargar confirmación'))
      .finally(() => setLoading(false))
  }, [searchParams, id])

  const handleDescargar = useCallback(async () => {
    if (!pago) return
    setDownloading(true)
    try {
      const blob = await descargarComprobante(pago.referencia)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `comprobante_${pago.referencia}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e: any) {
      alert(e.message || 'Error al descargar comprobante')
    } finally {
      setDownloading(false)
    }
  }, [pago])

  if (loading) {
    return (
      <FondoDecorado>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-[#6b7c45]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-[#3b5630] font-medium">Confirmando pago...</p>
          </div>
        </div>
      </FondoDecorado>
    )
  }

  if (error || !pago) {
    return (
      <FondoDecorado>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-md border border-[#e8e0d0] p-8 max-w-md text-center">
            <span className="text-4xl">⚠️</span>
            <p className="mt-4 text-red-600 font-medium">{error || 'No se pudo obtener la informacion del pago'}</p>
            <button onClick={() => router.push(`/pagos/reserva/${id}`)} className="mt-4 text-[#6b7c45] font-semibold underline cursor-pointer">
              Volver a intentar
            </button>
          </div>
        </div>
      </FondoDecorado>
    )
  }

  const estadoVisual = getEstadoVisual(pago.estado, pago.mp_status)
  const esExitoso = pago.estado === 2 || pago.mp_status === 'approved'
  const estadoLabel = (() => {
    switch (pago.estado) {
      case 1: return 'Pendiente'
      case 2: return 'Aprobado'
      case 3: return 'Declinado'
      case 4: return 'Expirado'
      default: return 'Desconocido'
    }
  })()

  return (
    <FondoDecorado>
      {/* Header */}
      <div className="relative z-10 w-full px-4 sm:px-6 pt-6 pb-2">
        <div className="max-w-md sm:max-w-lg mx-auto">
          <div className="flex items-center relative">
            <button
              onClick={() => router.push(`/pagos/reserva/${id}`)}
              className="text-xl text-[#1a1a1a] hover:opacity-60 transition cursor-pointer"
              aria-label="Volver"
            >
              ←
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 font-bold text-lg sm:text-xl text-[#1a1a1a] whitespace-nowrap">
              Confirmacion de Pago
            </h1>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex-1 flex flex-col items-center max-w-md sm:max-w-lg mx-auto w-full px-4 sm:px-6 pt-8 pb-10">
        {/* Icono de estado */}
        <div className="flex flex-col items-center mb-8">
          <div className={`w-20 h-20 rounded-full border-4 ${estadoVisual.colorBorde} flex items-center justify-center`}>
            <span className={`text-4xl font-bold ${estadoVisual.colorTxt.replace('text-', 'text-').replace('-700', '-500')} leading-none`}>
              {estadoVisual.icono}
            </span>
          </div>
          <p className={`mt-4 text-2xl sm:text-3xl font-bold ${estadoVisual.colorTxt}`}>
            {estadoVisual.titulo}
          </p>
        </div>

        {/* Card comprobante */}
        <div className="w-full bg-white rounded-2xl shadow-md border border-[#e8e0d0] p-5 sm:p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Referencia:</span>
              <span className="text-sm font-mono font-medium text-gray-900">{pago.referencia}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Monto:</span>
              <span className="text-sm font-medium text-gray-900">${Number(pago.monto).toLocaleString('es-CO')} {pago.moneda}</span>
            </div>
            {evento && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Evento:</span>
                <span className="text-sm font-medium text-gray-900">
                  {evento.name} {consolidado?.cantidad_tickets && `(x${consolidado.cantidad_tickets})`}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Fecha:</span>
              <span className="text-sm font-medium text-gray-900">
                {pago.fecha_confirmacion ? formatearFecha(pago.fecha_confirmacion) : formatearFecha(pago.fecha_creacion)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Estado:</span>
              <span className={`text-sm font-semibold ${estadoVisual.colorTxt}`}>{estadoLabel}</span>
            </div>
            {pago.mp_payment_id && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">ID Pago MP:</span>
                <span className="text-sm font-mono font-medium text-gray-900">{pago.mp_payment_id}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bandeja inferior con botones */}
      <div className="relative z-10 flex-1 max-w-md sm:max-w-lg mx-auto w-full mt-6
        bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
        px-6 pt-6 pb-8 flex flex-col">

        {esExitoso && (
          <button
            onClick={handleDescargar}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2
              bg-[#6b7c45] hover:bg-[#5a6b3a] disabled:opacity-50 text-white
              rounded-full py-3.5 font-semibold text-sm sm:text-base
              transition cursor-pointer"
          >
            {downloading ? 'Descargando...' : '📄 Descargar Comprobante (PDF)'}
          </button>
        )}

        <button
          onClick={() => router.push(`/pagos/reserva/${id}/detalle`)}
          className="w-full mt-3 bg-[#6b7c45] hover:bg-[#5a6b3a] text-white
            rounded-full py-3.5 font-semibold text-sm sm:text-base
            transition cursor-pointer"
        >
          Ver Detalle de Reserva
        </button>

        {!esExitoso && (
          <button
            onClick={() => router.push(`/pagos/reserva/${id}`)}
            className="w-full mt-3 border-2 border-[#6b7c45] text-[#6b7c45]
              rounded-full py-3.5 font-semibold text-sm sm:text-base
              hover:bg-[#6b7c45] hover:text-white transition cursor-pointer"
          >
            Reintentar Pago
          </button>
        )}
      </div>
    </FondoDecorado>
  )
}
