/**
 * Converts currency string to a number for calculations.
 * 
 * @param currencyStr - string | undefined
 * @returns number
 */
export function currencyToNumber(currencyStr: string | undefined): number {
  const cleanStr = currencyStr?.replace(/[^0-9.-]/g, '');
  const numberCon = typeof(cleanStr) === 'string' ? parseFloat(cleanStr) : NaN;

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
export function delay(min: number, max: number): Promise<void> {
  return new Promise(res => setTimeout(res, Math.floor(Math.random() * (max - min + 1)) + min));
}

/**
 * Formats current time and date to be used for file naming
 * 
 * @returns string
 */
export function formatDate(): string {
  const curDate = new Date().toJSON().split('T')
  const time = new Date().toLocaleTimeString('en-US').split(' ')[0];

  return `${curDate[0]}_${time}`;
}

/**
 * Formats the city name for console log into one that's more human readable
 * 
 * I.E.
 *  Austin, TX
 * 
 * @param city - string 
 * @returns string
 */
export function formatCity(city: string): string {
  let formattedCity = '';
  const cityArr = city.split('-');
  const state = cityArr.pop()?.toUpperCase();

  for (let i = 0; i < cityArr.length; i++) {
    const wordArr = cityArr[i].split('');
    const firstLetter = wordArr[0].toUpperCase();
    const restOfWord = wordArr.slice(1);

    if (i === cityArr.length - 1) formattedCity += `${firstLetter}${restOfWord.join('')}`;
    else formattedCity += `${firstLetter}${restOfWord.join('')} `;
  }

  return formattedCity += `, ${state}`;
}

/**
 * Prints Ascii Art for console.
 * 
 * Says welcome.
 */
export const welcome = `
 _       __     __                        
| |     / /__  / /________  ____ ___  ___ 
| | /| / / _ \\/ / ___/ __ \\/ __ \`__ \\/ _ \\
| |/ |/ /  __/ / /__/ /_/ / / / / / /  __/
|__/|__/\\___/_/\\___/\\____/_/ /_/ /_/\\___/ 
                                          
`