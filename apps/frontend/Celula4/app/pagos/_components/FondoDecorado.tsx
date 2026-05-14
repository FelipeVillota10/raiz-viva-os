import type { ReactNode } from 'react'

interface FondoDecoradoProps {
  children: ReactNode
}

export function FondoDecorado({ children }: FondoDecoradoProps) {
  return (
    <div className="min-h-screen bg-[#f9f3e7] relative flex flex-col overflow-x-hidden">

      {/* Decoracion izquierda */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <svg
          width="62"
          height="130"
          viewBox="0 0 62 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hoja 1 cafe */}
          <g transform="translate(24, 52) rotate(-28)">
            <path
              d="M 0 -36 C 16 -24 16 24 0 36 C -14 24 -14 -24 0 -36 Z"
              fill="#8B6914"
              opacity="0.42"
            />
            <line
              x1="0" y1="-32"
              x2="0" y2="32"
              stroke="#6B4F1A"
              strokeWidth="0.9"
              opacity="0.28"
            />
            <path d="M 0 -18 C 9 -12 11 -5 13 0"  stroke="#6B4F1A" strokeWidth="0.6" fill="none" opacity="0.20"/>
            <path d="M 0 -18 C -9 -12 -11 -5 -13 0" stroke="#6B4F1A" strokeWidth="0.6" fill="none" opacity="0.20"/>
            <path d="M 0 8 C 9 6 12 12 13 18"      stroke="#6B4F1A" strokeWidth="0.6" fill="none" opacity="0.18"/>
            <path d="M 0 8 C -9 6 -12 12 -13 18"   stroke="#6B4F1A" strokeWidth="0.6" fill="none" opacity="0.18"/>
          </g>

          {/* Hoja 2 verde */}
          <g transform="translate(38, 100) rotate(22)">
            <path
              d="M 0 -20 C 9 -13 9 13 0 20 C -8 13 -8 -13 0 -20 Z"
              fill="#3b5630"
              opacity="0.35"
            />
            <line
              x1="0" y1="-17"
              x2="0" y2="17"
              stroke="#3b5630"
              strokeWidth="0.7"
              opacity="0.22"
            />
          </g>
        </svg>
      </div>

      {/* Decoracion superior derecha */}
      <div
        className="absolute right-0 top-4 pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <svg
          width="58"
          height="72"
          viewBox="0 0 58 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hoja cafe */}
          <g transform="translate(38, 22) rotate(-40)">
            <path
              d="M 0 -22 C 10 -14 10 14 0 22 C -9 14 -9 -14 0 -22 Z"
              fill="#8B6914"
              opacity="0.40"
            />
            <line
              x1="0" y1="-19"
              x2="0" y2="19"
              stroke="#6B4F1A"
              strokeWidth="0.8"
              opacity="0.26"
            />
          </g>

          {/* Hoja verde */}
          <g transform="translate(22, 50) rotate(15)">
            <path
              d="M 0 -15 C 7 -10 7 10 0 15 C -6 10 -6 -10 0 -15 Z"
              fill="#3b5630"
              opacity="0.35"
            />
            <line
              x1="0" y1="-13"
              x2="0" y2="13"
              stroke="#3b5630"
              strokeWidth="0.7"
              opacity="0.22"
            />
          </g>
        </svg>
      </div>

      {/* Decoracion derecha */}
      <div
        className="absolute right-0 top-[52%] pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <svg
          width="52"
          height="200"
          viewBox="0 0 52 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ramita */}
          <path
            d="M 44 0 Q 35 50 41 100 Q 47 152 39 200"
            stroke="#8B6914"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.30"
          />

          {/* Hoja 1  */}
          <g transform="translate(40, 30) rotate(-50)">
            <path
              d="M 0 -13 C 7 -9 7 9 0 13 C -7 9 -7 -9 0 -13 Z"
              fill="#8B6914"
              opacity="0.32"
            />
            <line
              x1="0" y1="-11"
              x2="0" y2="11"
              stroke="#6B4F1A"
              strokeWidth="0.7"
              opacity="0.22"
            />
          </g>

          {/* Hoja 2 */}
          <g transform="translate(42, 100) rotate(40)">
            <path
              d="M 0 -14 C 7 -9 7 9 0 14 C -7 9 -7 -9 0 -14 Z"
              fill="#6B4F1A"
              opacity="0.30"
            />
            <line
              x1="0" y1="-12"
              x2="0" y2="12"
              stroke="#6B4F1A"
              strokeWidth="0.7"
              opacity="0.20"
            />
          </g>

          {/* Hoja 3 */}
          <g transform="translate(38, 168) rotate(-22)">
            <path
              d="M 0 -12 C 6 -8 6 8 0 12 C -6 8 -6 -8 0 -12 Z"
              fill="#8B6914"
              opacity="0.30"
            />
            <line
              x1="0" y1="-10"
              x2="0" y2="10"
              stroke="#6B4F1A"
              strokeWidth="0.7"
              opacity="0.20"
            />
          </g>
        </svg>
      </div>

      {children}
    </div>
  )
}
