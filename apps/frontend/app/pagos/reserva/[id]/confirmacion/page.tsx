'use client'

import { useRouter } from 'next/navigation'
import { mockPagoExitoso } from '@/lib/mocks/pagos.mock'
import type { PagoResultado } from '@/lib/types/pago'
import { FondoDecorado } from '@/app/pagos/_components/FondoDecorado'

function formatearFecha(iso: string): string {
  const [year, month, day] = iso.split('T')[0].split('-')
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${meses[parseInt(month) - 1]} ${day}, ${year}`
}

const FILAS: { label: string; valor: (p: PagoResultado) => string }[] = [
  { label: 'ID:',      valor: (p) => p.id },
  { label: 'Monto:',   valor: (p) => `$${p.monto} ${p.moneda}` },
  { label: 'Método:',  valor: (p) => `Visa **** ${p.ultimosDigitos}` },
  { label: 'Fecha:',   valor: (p) => formatearFecha(p.fecha) },
]

export default function ConfirmacionPagoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const pago: PagoResultado = mockPagoExitoso

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
              Confirmación de Pago
            </h1>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex-1 flex flex-col items-center max-w-md sm:max-w-lg mx-auto w-full px-4 sm:px-6 pt-8 pb-10">

        {/* Icono de exito */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center">
            <span className="text-4xl font-bold text-green-500 leading-none">✓</span>
          </div>
          <p className="mt-4 text-2xl sm:text-3xl font-bold text-green-700">¡Pago Exitoso!</p>
        </div>

        {/* Card comprobante */}
        <div className="w-full bg-white rounded-2xl shadow-md border border-[#e8e0d0] p-5 sm:p-6">
          <div className="space-y-3">
            {FILAS.map(({ label, valor }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{label}</span>
                <span className={`text-sm font-medium text-gray-900 ${label === 'ID:' ? 'font-mono' : ''}`}>
                  {valor(pago)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bandeja inferior con botones */}
      <div className="relative z-10 flex-1 max-w-md sm:max-w-lg mx-auto w-full mt-6
                      bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
                      px-6 pt-6 pb-8 flex flex-col">

        <button
          onClick={() => alert('Descarga de comprobante - Próximamente')}
          className="w-full flex items-center justify-center gap-2
                     bg-[#6b7c45] hover:bg-[#5a6b3a] text-white
                     rounded-full py-3.5 font-semibold text-sm sm:text-base
                     transition cursor-pointer"
        >
          <span>📄</span>
          Descargar Comprobante (PDF)
        </button>

        <button
          onClick={() => router.push(`/pagos/reserva/${params.id}/detalle`)}
          className="w-full mt-3 bg-[#6b7c45] hover:bg-[#5a6b3a] text-white
                     rounded-full py-3.5 font-semibold text-sm sm:text-base
                     transition cursor-pointer"
        >
          Ver Detalle de Reserva
        </button>

      </div>

    </FondoDecorado>
  )
}
