export function currencyToNumber(currencyStr: string | undefined): number {
  const cleanStr = currencyStr?.replace(/[^0-9.-]/g, '');
  const numberCon = typeof(cleanStr) === 'string' ? parseFloat(cleanStr) : NaN;

  if (isNaN(numberCon)) return NaN;

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

export function formatDate(): string {
  const curDate = new Date().toJSON().split('T')
  const time = new Date().toLocaleTimeString('en-US').split(' ')[0];

  return `${curDate[0]}_${time}`;
}

/**
 * Used to change color and font of console depending on use case.
 * 
 * Different arguments include:
 *  * 'greeting'
 *  * 'exit'
 *  * Leave argument empty to reset console
 * 
 * @param c string
 * @returns string
 */
export function consoleOut(c?: string): string {
  switch (c) {
    case 'greeting':
      return "color: green; font-size: 32px;"
      break;
    case 'exit':
      return "color: green; "
      break;
    default:
      // Used to reset console color
      return '\x1b[0m';
  }
}