export function formatDate(date: string) {
  const [datePart, timePart] = date.split('-')
  const [year, month, day] = datePart.split('/')

  // Cria a string no formato ISO 8601 (adicionando segundos e milissegundos para compatibilidade)
  const isoString = `${year}-${month}-${day}T${timePart}:00.000Z`

  return isoString
}
