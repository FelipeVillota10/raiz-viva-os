'use client'

import { useRouter } from 'next/navigation'
import { use, useState } from 'react'
import { mockReserva } from '@/lib/mocks/reservas.mock'
import type { Reserva } from '@/lib/types/reserva'
import type { TipoMetodoPago } from '@/lib/types/pago'
import { MOCK_MODE } from '@/lib/config'

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

const REGEX_NUMERO = /^\d{8,19}$/
const REGEX_EXPIRACION = /^(0[1-9]|1[0-2])\/\d{2}$/
const REGEX_CVV = /^\d{3,4}$/

function esFechaVigente(exp: string): boolean {
  const [mm, aa] = exp.split('/')
  const fecha = new Date(2000 + parseInt(aa, 10), parseInt(mm, 10) - 1, 1)
  const hoy = new Date()
  return fecha >= new Date(hoy.getFullYear(), hoy.getMonth(), 1)
}

export default function DetallesTarjetaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const reserva: Reserva = mockReserva

  const [titular,      setTitular]      = useState('')
  const [numero,       setNumero]       = useState('')
  const [expiracion,   setExpiracion]   = useState('')
  const [cvv,          setCvv]          = useState('')
  const [errorMsg,     setErrorMsg]     = useState<string | null>(null)
  const [loading,      setLoading]      = useState(false)
  const [metodoActivo, setMetodoActivo] = useState<TipoMetodoPago>('tarjeta')

  const total = reserva.total

  function handleCambiarMetodo(tipo: TipoMetodoPago) {
    if (tipo !== 'tarjeta') {
      router.push(`/pagos/reserva/${id}/${tipo}`)
      return
    }
    setMetodoActivo(tipo)
  }

  function handleNumeroChange(raw: string) {
    setNumero(raw.replace(/[^\d\s]/g, ''))
  }

  function handleExpiracionChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 4)
    setExpiracion(digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits)
  }

  function handleCvvChange(raw: string) {
    setCvv(raw.replace(/\D/g, ''))
  }

  function handlePagar() {
    const numeroLimpio = numero.replace(/\s/g, '')
    if (!titular.trim()) {
      setErrorMsg('Ingrese el nombre del titular')
      return
    }
    if (!REGEX_NUMERO.test(numeroLimpio)) {
      setErrorMsg('El número de tarjeta debe tener entre 8 y 19 dígitos')
      return
    }
    if (!REGEX_EXPIRACION.test(expiracion)) {
      setErrorMsg('Formato de expiración inválido (use MM/AA)')
      return
    }
    if (!MOCK_MODE && !esFechaVigente(expiracion)) {
      setErrorMsg('La tarjeta está vencida')
      return
    }
    if (!REGEX_CVV.test(cvv)) {
      setErrorMsg('El CVV debe tener 3 o 4 dígitos')
      return
    }
    setErrorMsg(null)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      router.push(`/pagos/reserva/${id}/confirmacion`)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#f9f3e7] relative flex flex-col overflow-x-hidden">

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
              Detalles de Tarjeta
            </h1>
          </div>
        </div>
      </div>

      {/* Cuerpo principal */}
      <div className="flex-1 flex flex-col lg:flex-row lg:items-start lg:gap-6
                      max-w-md sm:max-w-lg lg:max-w-5xl mx-auto w-full
                      px-4 sm:px-6 lg:px-8 pt-4 pb-56 lg:pb-10">

        {/* Columna izquierda: alerta + formulario */}
        <div className="relative z-10 w-full lg:flex-[3] flex flex-col gap-4">

          {/* Alerta de error */}
          {errorMsg !== null && (
            <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-xl leading-none mt-0.5" aria-hidden="true">⚠️</span>
              <p className="text-sm text-red-600">
                <span className="font-bold">Error: </span>
                {errorMsg}
              </p>
            </div>
          )}

          {/* Card formulario */}
          <div className="bg-[#f5f0e8] rounded-2xl shadow-md border border-[#e8e0d0] p-4">

            {/* Nombre en la tarjeta */}
            <div className="mb-2">
              <label htmlFor="titular" className="sr-only">Nombre en la tarjeta</label>
              <input
                id="titular"
                name="ccname"
                type="text"
                autoComplete="cc-name"
                placeholder="Nombre en la Tarjeta"
                value={titular}
                onChange={(e) => setTitular(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3.5
                           text-gray-700 placeholder-gray-400 text-sm sm:text-base
                           focus:outline-none focus:border-[#6b7c45] transition"
              />
            </div>

            {/* Número de tarjeta */}
            <div className="mb-2 relative">
              <label htmlFor="numero" className="sr-only">Número de tarjeta</label>
              <input
                id="numero"
                name="cardnumber"
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="Número de Tarjeta"
                value={numero}
                onChange={(e) => handleNumeroChange(e.target.value)}
                maxLength={19}
                className={`w-full bg-white rounded-xl p-3.5 pr-16
                            text-gray-700 placeholder-gray-400 text-sm sm:text-base
                            focus:outline-none transition border
                            ${errorMsg !== null ? 'border-red-400' : 'border-[#6b7c45]'}`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2
                               font-bold italic text-blue-900 font-serif text-sm select-none">
                VISA
              </span>
            </div>

            {/* Expiración + CVV */}
            <div className="flex gap-3">
              <label htmlFor="expiracion" className="sr-only">Fecha de expiración</label>
              <input
                id="expiracion"
                name="exp-date"
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/AA"
                value={expiracion}
                onChange={(e) => handleExpiracionChange(e.target.value)}
                maxLength={5}
                className="w-1/2 bg-white border border-gray-200 rounded-xl p-3.5
                           text-gray-700 placeholder-gray-400 text-sm sm:text-base
                           focus:outline-none focus:border-[#6b7c45] transition"
              />
              <label htmlFor="cvv" className="sr-only">Código de seguridad</label>
              <input
                id="cvv"
                name="cvc"
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => handleCvvChange(e.target.value)}
                maxLength={4}
                className="w-1/2 bg-white border border-gray-200 rounded-xl p-3.5
                           text-gray-700 placeholder-gray-400 text-sm sm:text-base
                           focus:outline-none focus:border-[#6b7c45] transition"
              />
            </div>

            {/* Total a pagar */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#e0d8c8]">
              <span className="text-base text-[#1a1a1a]">Total a Pagar:</span>
              <span className="text-base font-bold text-[#1a1a1a]">${total} USD</span>
            </div>
          </div>

        </div>

        {/* Hojas decorativas entre los dos cards, solo mobile */}
        <div className="relative h-14 overflow-hidden lg:hidden" aria-hidden="true">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
            <svg width="58" height="90" viewBox="0 0 58 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(22, 36) rotate(-28)">
                <path d="M 0 -28 C 12 -18 12 18 0 28 C -11 18 -11 -18 0 -28 Z" fill="#8B6914" opacity="0.40"/>
                <line x1="0" y1="-24" x2="0" y2="24" stroke="#6B4F1A" strokeWidth="0.8" opacity="0.26"/>
              </g>
              <g transform="translate(38, 68) rotate(20)">
                <path d="M 0 -18 C 8 -12 8 12 0 18 C -7 12 -7 -12 0 -18 Z" fill="#3b5630" opacity="0.34"/>
                <line x1="0" y1="-15" x2="0" y2="15" stroke="#3b5630" strokeWidth="0.7" opacity="0.22"/>
              </g>
            </svg>
          </div>
        </div>

        {/* Columna derecha: método de pago + botón, fijo al fondo en mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-20
                        lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:z-10
                        lg:flex-none lg:flex-[2]
                        bg-white
                        rounded-t-3xl lg:rounded-2xl
                        shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
                        px-6 sm:px-7 pt-5 pb-6
                        lg:sticky lg:top-6">

          <h2 className="font-bold text-[#1a1a1a] text-base sm:text-lg mb-4 flex items-center gap-2">
            <span>💳</span> Método de Pago
          </h2>

          {/* Segmented control */}
          <div className="flex bg-[#f5f0e8] rounded-2xl p-1.5">
            {METODOS.map((metodo) => {
              const activo = metodoActivo === metodo.tipo
              return (
                <button
                  key={metodo.tipo}
                  onClick={() => handleCambiarMetodo(metodo.tipo)}
                  aria-pressed={activo}
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

          {/* Botón pagar */}
          <button
            onClick={handlePagar}
            disabled={loading}
            className="w-full mt-5"
          >
            <span className={`
              flex items-center justify-center gap-2
              rounded-full py-4 text-base sm:text-lg font-semibold
              transition text-white cursor-pointer
              ${loading
                ? 'bg-[#8a9d6a]'
                : 'bg-[#6b7c45] hover:bg-[#5a6b3a]'
              }
            `}>
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Procesando...
                </>
              ) : errorMsg !== null ? (
                `Reintentar Pago ($${total} USD)`
              ) : (
                `Pagar ($${total} USD)`
              )}
            </span>
          </button>

        </div>
      </div>
    </div>
  )
}
