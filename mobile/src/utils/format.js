// Utilitários de formatação numérica

export function formatRating(value, digits = 1, fallback = '0.0') {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (Number.isFinite(numericValue)) {
    return numericValue.toFixed(digits);
  }
  return fallback;
}



