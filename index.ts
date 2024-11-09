import readline from 'readline';
import scrapeSite from './src/siteScraper';
import dataParser from './src/dataParser';
import fs from 'node:fs';
import path from 'node:path';
import { formatCity, formatDate } from './utils';

const locationRegex = /^([a-z]-?){1,40}[-]{1}?([a-z]){1,2}$/g;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Welcome!\n\nWhat location do you want to search?\n', response => {
  if (!locationRegex.test(response)) {
    console.log('Incorrect Format. Try again!');
    rl.close();
    return;
  }

  scrapeSite(`https://www.apartments.com/${response}/`).then((res) => {
    if (!res) {
      throw new Error('No Properties found!');
    }

    console.log('\n\nGenerating files...\n');
    try {
      const dateStr = formatDate();

      const fileName = `${response}_${dateStr}.json`;

      const propertyFolder = path.resolve('floorplans');
      const averageFolder = path.resolve('averages');

      fs.mkdirSync(propertyFolder, { recursive: true });
      fs.mkdirSync(averageFolder, { recursive: true });

      fs.writeFile(path.join(propertyFolder, fileName), JSON.stringify(res), (e) => {
        if (e) {
          console.log(e);
        }
      });
      console.log(`File successfully created for ${formatCity(response)}. See file at ${path.join(propertyFolder, fileName)}\n`);

      console.log(`Parsing Property data...`);
      const allAverages = dataParser(res);

      fs.writeFile(path.join(averageFolder, fileName), JSON.stringify(allAverages), (e) => {
        if (e) {
          console.log(e);
        }
      })
      console.log(`\nAverage file written. See file at ${path.join(propertyFolder, fileName)}`);
      console.log('\n\nExiting now.\nGoodbye!\n');
    } catch (e) {
      console.log(`Could not generate file(s): `, e);
    }
  });
  rl.close();
});
