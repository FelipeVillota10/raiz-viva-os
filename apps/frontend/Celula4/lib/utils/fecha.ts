export function formatearFecha(iso: string): string {
  const [year, month, day] = iso.split('T')[0].split('-')
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${meses[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`
}
