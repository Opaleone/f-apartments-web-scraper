export default function currencyToNumber(currencyStr: string | undefined): number {
  const cleanStr = currencyStr?.replace(/[^0-9.-]/g, '');
  const numberCon = typeof(cleanStr) === 'string' ? parseFloat(cleanStr) : NaN;

  if (isNaN(numberCon)) throw new Error('Invalid currency format');

  return numberCon;
}