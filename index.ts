import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { styleText } from 'node:util';
import { formatCity, formatDate, welcome } from './utils';
import scrapeSite from './src/siteScraper';
import dataParser from './src/dataParser';
import { input } from '@inquirer/prompts';

const locationRegex = /^([a-z]-?){1,40}[-]{1}?([a-z]){1,2}$/g;

console.log(styleText(['green'], welcome));

(async () => {
  const city = await input({ message: "What location do you want to search?" }, { clearPromptOnDone: true });

  if (!locationRegex.test(city)) {
    throw new Error('Incorrect Format. Try again!');
  }

  scrapeSite(`https://www.apartments.com/${city}/`).then((res) => {
    if (!res) {
      throw new Error('No Properties found!');
    }

    console.log('\n\nGenerating files...\n');
    try {
      const dateStr = formatDate();
      const cityName = formatCity(city);

      const fileName = `${city}_${dateStr}.json`;

      const propertyFolder = path.resolve('floorplans');
      const averageFolder = path.resolve('averages');

      fs.mkdirSync(propertyFolder, { recursive: true });
      fs.mkdirSync(averageFolder, { recursive: true });

      fs.writeFile(path.join(propertyFolder, fileName), JSON.stringify(res), (e) => {
        if (e) {
          console.log(e);
        }
      });
      console.log(styleText(['green'], `File successfully created for ${cityName}. See file at ${path.join(propertyFolder, fileName)}\n`));

      console.log(`Parsing Property data...`);
      const allAverages = dataParser(res, cityName);

      fs.writeFile(path.join(averageFolder, fileName), JSON.stringify(allAverages), (e) => {
        if (e) {
          console.log(e);
        }
      })
      console.log(styleText(['green'], `\nAverage file written. See file at ${path.join(propertyFolder, fileName)}`));
      console.log(styleText(['magentaBright'], `\n\nExiting now.\nGoodbye!`));
    } catch (e) {
      console.error(`Could not generate file(s): \n`, e);
    }
  });
})();