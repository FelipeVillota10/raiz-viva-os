'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { mockReserva } from '@/lib/mocks/reservas.mock'
import type { Reserva } from '@/lib/types/reserva'
import type { TipoMetodoPago } from '@/lib/types/pago'

interface MetodoPagoTab {
  tipo: TipoMetodoPago
  label: string
  icono: string
}

const METODOS: MetodoPagoTab[] = [
  { tipo: 'tarjeta',       label: 'Tarjeta',           icono: '💳' },
  { tipo: 'transferencia', label: 'Transferencia',     icono: '⇄' },
  { tipo: 'billetera',     label: 'Billetera Digital', icono: 'wallet' },
]

export default function PagarReservaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const reserva: Reserva = mockReserva
  const [metodoActivo, setMetodoActivo] = useState<TipoMetodoPago>('tarjeta')

  const servicioAdicional = reserva.serviciosAdicionales[0]

  function formatearFecha(iso: string): string {
    const [year, month, day] = iso.split('-')
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    return `${meses[parseInt(month) - 1]} ${day}, ${year}`
  }

  function handlePagar() {
    router.push(`/pagos/reserva/${params.id}/tarjeta`)
  }

  return (
    <div className="min-h-screen bg-[#f9f3e7] relative flex flex-col">

      {/* Decoracion esquinas */}
      <span className="absolute top-2 left-2 text-4xl opacity-20 pointer-events-none select-none">🌿</span>
      <span className="absolute top-2 right-2 text-4xl opacity-20 pointer-events-none select-none rotate-45">🍂</span>

      {/* Header */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="max-w-md sm:max-w-lg lg:max-w-5xl mx-auto">
          <div className="flex items-center relative">
            <button
              onClick={() => router.back()}
              className="text-xl text-[#1a1a1a] hover:opacity-60 transition cursor-pointer"
              aria-label="Volver"
            >
              ←
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 font-bold text-lg sm:text-xl text-[#1a1a1a] whitespace-nowrap">
              Pagar Reserva
            </h1>
          </div>
        </div>
      </div>

      {/* Cuerpo principal */}
      <div className="flex-1 flex flex-col lg:flex-row lg:items-start lg:gap-6
                      max-w-md sm:max-w-lg lg:max-w-5xl mx-auto w-full
                      px-4 sm:px-6 lg:px-8 pt-4 lg:pb-10">

        {/* Columna izquierda: card de resumen */}
        <div className="w-full lg:flex-[3]">
          <div className="rounded-2xl shadow-sm overflow-hidden">

            {/* Zona superior */}
            <div className="bg-white p-5 sm:p-6">
              <div className="flex gap-4 items-start">
                <div className="relative w-28 h-32 sm:w-32 sm:h-36 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={reserva.experiencia.imagen}
                    alt={reserva.experiencia.nombre}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm sm:text-base text-[#1a1a1a] mb-2">
                    Resumen Detallado de Compra
                  </p>
                  <p className="font-semibold text-sm sm:text-base text-[#1a1a1a]">
                    Servicios de Experiencia:
                  </p>
                  <p className="text-sm sm:text-base text-gray-700 mt-1">
                    {reserva.experiencia.nombre}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs sm:text-sm text-gray-500">
                      Cantidad: {reserva.experiencia.cantidad}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-[#1a1a1a]">
                      ${reserva.experiencia.precio * reserva.experiencia.cantidad} USD
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Zona inferior: fondo crema */}
            <div className="bg-[#f5f0e8] px-5 sm:px-6 py-4 sm:py-5 space-y-4">

              {servicioAdicional && (
                <div>
                  <p className="font-semibold text-sm sm:text-base text-[#1a1a1a] mb-1">
                    Servicios Adicionales:
                  </p>
                  <p className="text-sm sm:text-base text-gray-700">{servicioAdicional.nombre}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs sm:text-sm text-gray-500">
                      Cantidad: {servicioAdicional.cantidad}
                    </span>
                    <span className="text-sm sm:text-base text-gray-700">
                      Subtotal: ${servicioAdicional.subtotal} USD
                    </span>
                  </div>
                </div>
              )}

              <hr className="border-[#e0d8c8]" />

              <div className="flex justify-between text-sm sm:text-base text-gray-600">
                <span>{formatearFecha(reserva.fechaInicio)}</span>
                <span>{formatearFecha(reserva.fechaFin)}</span>
              </div>

              <hr className="border-[#e0d8c8]" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm sm:text-base text-gray-700">
                  <span>Subtotal (Experiencia + Adicionales):</span>
                  <span className="font-medium">${reserva.subtotal} USD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">Total a Pagar:</span>
                  <span className="font-bold sm:text-lg text-[#1a1a1a]">${reserva.total} USD</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Columna derecha: método de pago + botón */}
        <div className="flex-1 lg:flex-none lg:flex-[2]
                        bg-white
                        rounded-t-3xl lg:rounded-2xl
                        shadow-[0_-4px_20px_rgba(0,0,0,0.1)] lg:shadow-md
                        px-6 sm:px-7 pt-6 pb-8
                        flex flex-col
                        lg:sticky lg:top-6">

          <h2 className="font-bold text-[#1a1a1a] text-base sm:text-lg mb-4 flex items-center gap-2">
            <span>💳</span> Método de Pago
          </h2>

          <div className="flex bg-[#f5f0e8] rounded-2xl p-1.5">
            {METODOS.map((metodo) => {
              const activo = metodoActivo === metodo.tipo
              return (
                <button
                  key={metodo.tipo}
                  onClick={() => setMetodoActivo(metodo.tipo)}
                  className={`
                    flex-1 flex flex-col items-center gap-1
                    py-3 sm:py-4
                    text-xs sm:text-sm font-medium
                    rounded-xl transition-all duration-200 cursor-pointer
                    ${activo
                      ? 'bg-white shadow-sm text-[#1a1a1a]'
                      : 'bg-transparent text-gray-500'
                    }
                  `}
                >
                  {metodo.icono === '⇄' ? (
                    <span className="text-2xl sm:text-3xl font-bold text-black leading-none">⇄</span>
                  ) : metodo.icono === 'wallet' ? (
                    <svg width="26" height="22" viewBox="0 0 26 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <rect x="1" y="5" width="24" height="16" rx="3" stroke="#1a1a1a" strokeWidth="1.8"/>
                      <path d="M1 9C1 7.34 2.34 6 4 6H22C23.66 6 25 7.34 25 9V9H1V9Z" fill="#1a1a1a"/>
                      <path d="M1 5C1 3.34 2.34 2 4 2H18L22 6H4C2.34 6 1 4.66 1 3V5Z" stroke="#1a1a1a" strokeWidth="1.8" strokeLinejoin="round"/>
                      <rect x="17" y="12" width="6" height="4" rx="1.5" fill="#1a1a1a"/>
                    </svg>
                  ) : (
                    <span className="text-2xl sm:text-3xl">{metodo.icono}</span>
                  )}
                  <span className="text-center leading-tight">{metodo.label}</span>
                </button>
              )
            })}
          </div>

          <button
            onClick={handlePagar}
            className="w-full mt-auto pt-6"
          >
            <span className="block bg-[#6b7c45] hover:bg-[#5a6b3a] transition text-white rounded-full py-4 text-lg sm:text-xl font-semibold cursor-pointer">
              Pagar ${reserva.total} USD
            </span>
          </button>

        </div>
      </div>
    </div>
  )
}
