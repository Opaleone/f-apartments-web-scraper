export function currencyToNumber(currencyStr: string | undefined): number {
  const cleanStr = currencyStr?.replace(/[^0-9.-]/g, '');
  const numberCon = typeof(cleanStr) === 'string' ? parseFloat(cleanStr) : NaN;

  if (isNaN(numberCon)) throw new Error('Invalid currency format');

  return numberCon;
}

/**
 * Used to delay function runs in an attempt to both mimic human behavior and not overload website being scraped.
 * 
 * Sleeps for a random amount of time between given minimum time and maximum time.
 * 
 * @param min number
 * @param max number
 * @returns Promise
 */
export function delay(min: number, max: number) {
  return new Promise(res => setTimeout(res, Math.floor(Math.random() * (max - min + 1)) + min));
}