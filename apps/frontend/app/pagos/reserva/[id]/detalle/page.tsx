'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { use, useState, useEffect } from 'react'
import { obtenerEvento } from '@/services/pago-evento.service'
import { consultarRespuesta, descargarComprobante } from '@/services/pago.service'
import type { Event } from '@/models/event.model'
import type { PagoRespuesta } from '@/models/pago'
import { FondoDecorado } from '@/components/layouts/PagosFondoDecorado'
import { formatearFecha } from '@/utils/fecha'

function IconoCalendario() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="flex-shrink-0">
      <rect x="1" y="2" width="14" height="13" rx="2" stroke="#1a1a1a" strokeWidth="1.4" />
      <path d="M1 6h14" stroke="#1a1a1a" strokeWidth="1.4" />
      <path d="M5 1v2M11 1v2" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="3.5" y="8.5" width="2" height="2" rx="0.4" fill="#1a1a1a" />
      <rect x="7" y="8.5" width="2" height="2" rx="0.4" fill="#1a1a1a" />
      <rect x="10.5" y="8.5" width="2" height="2" rx="0.4" fill="#1a1a1a" />
    </svg>
  )
}

function IconoReloj() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="flex-shrink-0">
      <circle cx="8" cy="8" r="6.5" stroke="#1a1a1a" strokeWidth="1.4" />
      <path d="M8 4.5V8l2.5 2" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconoPin() {
  return (
    <svg width="13" height="16" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="flex-shrink-0 mt-0.5">
      <path d="M6.5 0C3.47 0 1 2.47 1 5.5C1 9.625 6.5 16.5 6.5 16.5C6.5 16.5 12 9.625 12 5.5C12 2.47 9.53 0 6.5 0Z" stroke="#1a1a1a" strokeWidth="1.3" fill="none" />
      <circle cx="6.5" cy="5.5" r="2" stroke="#1a1a1a" strokeWidth="1.3" />
    </svg>
  )
}

export default function DetalleReservaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [evento, setEvento] = useState<Event | null>(null)
  const [pago, setPago] = useState<PagoRespuesta | null>(null)
  const [consolidado, setConsolidado] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    setLoading(true)
    setError(null)

    fetch(`${API_BASE}/api/consolidado_eventos/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar la información de la reserva")
        return res.json()
      })
      .then((consolidadoData) => {
        setConsolidado(consolidadoData)
        return obtenerEvento(Number(consolidadoData.evento))
      })
      .then((eventoData) => {
        setEvento(eventoData)
      })
      .catch((e: any) => setError(e.message || 'Error al cargar los datos'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDescargar = async () => {
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
  }

  if (loading) {
    return (
      <FondoDecorado>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-[#6b7c45]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-[#3b5630] font-medium">Cargando detalle...</p>
          </div>
        </div>
      </FondoDecorado>
    )
  }

  if (!evento) {
    return (
      <FondoDecorado>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-md border border-[#e8e0d0] p-8 max-w-md text-center">
            <span className="text-4xl">⚠️</span>
            <p className="mt-4 text-red-600 font-medium">{error || 'Evento no encontrado'}</p>
            <button onClick={() => router.back()} className="mt-4 text-[#6b7c45] font-semibold underline cursor-pointer">
              Volver
            </button>
          </div>
        </div>
      </FondoDecorado>
    )
  }

  return (
    <FondoDecorado>
      {/* Header */}
      <div className="relative z-10 w-full px-4 sm:px-6 pt-6 pb-2">
        <div className="max-w-md sm:max-w-lg mx-auto">
          <div className="flex items-center relative">
            <button
              onClick={() => router.back()}
              className="text-xl text-[#1a1a1a] hover:opacity-60 transition cursor-pointer"
              aria-label="Volver"
            >
              ←
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 font-bold text-lg sm:text-xl text-[#1a1a1a] whitespace-nowrap">
              Detalle de Reserva
            </h1>
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="relative z-10 flex-1 flex flex-col max-w-md sm:max-w-lg mx-auto w-full px-4 sm:px-6 pt-4 pb-36 gap-4">

        {/* Card de estado */}
        <div className="bg-[#f5f0e8] border border-[#e8e0d0] rounded-2xl px-5 py-3.5 flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] flex-shrink-0" />
          <span className="text-sm text-[#1a1a1a]">
            {/*Territorio: <span className="font-semibold text-[#557149]">{evento.territorio.nombre_territorio}</span>*/}
          </span>
        </div>

        {/* Card de experiencia */}
        <div className="bg-white border border-[#e8e0d0] rounded-2xl p-5 sm:p-6 shadow-sm">
          <p className="font-bold text-base sm:text-lg text-[#1a1a1a] mb-4">
            {evento.name}
          </p>

          {evento.startDate && (
            <div className="flex items-center gap-5 mb-3">
              <span className="flex items-center gap-1.5 text-sm text-[#4b5563]">
                <IconoCalendario />
                {formatearFecha(evento.startDate)}
              </span>
            </div>
          )}

          {/*{evento.territorio.region && (
            <div className="flex items-start gap-1.5 mb-3">
              <IconoPin />
              <span className="text-sm text-[#4b5563]">{evento.territorio.region}</span>
            </div>
          )} */}

          <div className="space-y-2 mt-3 pt-3 border-t border-[#e0d8c8]">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Precio Unitario:</span>
              <span className="text-sm font-medium text-[#1a1a1a]">
                {evento.price ? `$${Number(evento.price).toLocaleString('es-CO')} COP` : 'N/A'}
              </span>
            </div>
            {consolidado && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Tickets Reservados:</span>
                  <span className="text-sm font-medium text-[#1a1a1a]">{consolidado.cantidad_tickets}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Reserva:</span>
                  <span className="text-sm font-semibold text-[#1a1a1a]">
                    ${Number(consolidado.monto_pagado).toLocaleString('es-CO')} COP
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Estado de Pago:</span>
                  <span className={`text-sm font-bold ${consolidado.pagado ? 'text-green-600' : 'text-yellow-600'}`}>
                    {consolidado.pagado ? '✓ Pagado' : '⏳ Pendiente'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card guia local / actor */}
        <div className="bg-white border border-[#e8e0d0] rounded-2xl p-5 sm:p-6 shadow-sm">
          <p className="font-bold text-base text-[#1a1a1a] mb-4">Actor Principal</p>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full bg-[#557149] flex items-center justify-center flex-shrink-0">
                {/* <span className="text-white font-bold text-lg">
                 {evento.actor_principal.nombre.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <span className="font-medium text-sm sm:text-base text-[#1a1a1a] truncate block">
                  {evento.actor_principal.nombre}
                </span>
                <span className="text-xs text-gray-500 truncate block">{evento.actor_principal.email}</span> */}
              </div>
            </div>
          </div>
        </div>

        {/* Mapa placeholder */}
        <div className="bg-[#f5f0e8] border border-[#e8e0d0] rounded-2xl overflow-hidden shadow-sm">
          <div className="relative h-44 sm:h-52 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="mapa-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#557149" strokeWidth="0.4" opacity="0.35" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mapa-grid)" />
              <path d="M 0 110 Q 70 70 150 95 T 400 75" stroke="#557149" strokeWidth="2" fill="none" strokeDasharray="7 4" opacity="0.25" />
              <path d="M 30 155 Q 110 125 190 148 T 400 128" stroke="#557149" strokeWidth="1.2" fill="none" strokeDasharray="5 5" opacity="0.18" />
              <path d="M 120 0 Q 115 50 125 100 Q 130 150 120 220" stroke="#557149" strokeWidth="1" fill="none" strokeDasharray="4 6" opacity="0.15" />
            </svg>
            <div className="relative flex flex-col items-center gap-2 z-10">
              <svg width="42" height="52" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M18 0C8.06 0 0 8.06 0 18C0 31.5 18 44 18 44C18 44 36 31.5 36 18C36 8.06 27.94 0 18 0Z" fill="#557149" />
                <circle cx="18" cy="18" r="7" fill="white" />
              </svg>
              <span className="text-xs font-medium text-[#557149] bg-white/85 px-3 py-1 rounded-full shadow-sm max-w-[200px] text-center leading-tight">
              {/*  {evento.territorio.nombre_territorio}{evento.territorio.region ? `, ${evento.territorio.region}` : ''}
              */}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior fija */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-md sm:max-w-lg mx-auto">
          <div className="bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.10)] rounded-t-3xl px-6 pt-5 pb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm sm:text-base text-[#4b5563]">Total:</span>
              <span className="text-lg sm:text-xl font-bold text-[#1a1a1a]">
                {consolidado ? `$${Number(consolidado.monto_pagado).toLocaleString('es-CO')} COP` : (evento.price ? `$${Number(evento.price).toLocaleString('es-CO')} COP` : 'N/A')}
              </span>
            </div>

            {consolidado?.pagado ? (
              <button
                disabled
                className="w-full bg-green-600 text-white rounded-xl py-4 font-semibold text-base sm:text-lg cursor-not-allowed opacity-75"
              >
                ✓ Pago Completado
              </button>
            ) : (
              <button
                onClick={() => router.push(`/pagos/reserva/${id}`)}
                className="w-full bg-[#6b7c45] hover:bg-[#5a6b3a] text-white
                  rounded-xl py-4 font-semibold text-base sm:text-lg
                  transition cursor-pointer"
              >
                Ir a Pagar
              </button>
            )}
          </div>
        </div>
      </div>
    </FondoDecorado>
  )
}
