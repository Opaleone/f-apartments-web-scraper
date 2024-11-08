import readline from 'readline';
import scrapeSite from './src/siteScraper';
import dataParser from './src/dataParser';
import fs from 'node:fs'
import { formatDate } from './utils';

const locationRegex = /^([a-z]-?){1,40}[-]{1}?([a-z]){1,2}$/g;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Welcome!\n\nWhat location do you want to search?\n', response => {
  if (!locationRegex.test(response)) {
    console.log('Incorrect Format. Try again!');
    rl.close();
  }

  scrapeSite(`https://www.apartments.com/${response}/`).then((res) => {
    console.log('\n\nGenerating files...\n');
    try {
      const dateStr = formatDate();

      const fileName = `${response}_${dateStr}.json`;

      const propertyFolder = './propertyFloorPlans';
      const averageFolder = './floorPlanAvgs';

      fs.mkdir('./propertyFloorPlans', e => {
        if (e?.code !== 'EEXIST') console.log(`propertyFloorPlans folder created successfully.`);
      })
      fs.mkdir('./floorPlanAvgs', e => {
        if (e?.code !== 'EEXIST') console.log(`floorPlanAvgs folder created successfully.`);
      })

      fs.writeFile(`${propertyFolder}/${fileName}`, JSON.stringify(res), (e) => {
        console.log(e);
      })
      console.log(`\nCity file successfully created. See file at ./propertyFloorPlans/${fileName}.\n`);

      console.log(`Parsing Property data...`);
      const allAverages = dataParser(res);

      fs.writeFile(`${averageFolder}/${fileName}`, JSON.stringify(allAverages), (e) => {
        console.log(e);
      })
      console.log(`\nAverage file written. See file at ./floorPlanAvgs/${fileName}`);
      console.log('\n\nExiting now. Goodbye!\n');
    } catch (e) {
      console.log(`Could not generate file(s): `, e);
    }
  });
  rl.close();
});
