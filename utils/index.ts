export default function currencyToNumber(currencyStr: string): number {
  const cleanStr = currencyStr.replace(/[^0-9.-]/g, '');
  const numberCon = parseFloat(cleanStr);

  if (isNaN(numberCon)) throw new Error('Invalid currency format');

  return numberCon;
}