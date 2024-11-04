import readline from 'readline';
import scrapeSite from './src/siteScraper';
import dataParser from './src/dataParser';
import fs from 'node:fs'

const locationRegex = /^([a-z]-?){1,40}[-]{1}?([a-z]){1,2}$/g;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('What location do you want to search?\n', response => {
  if (!locationRegex.test(response)) {
    console.log('Incorrect Format. Try again!');
    rl.close();
  }

  scrapeSite(`https://www.apartments.com/${response}/`).then((res) => {
    console.log('\n\nWriting to file...\n')
    try {
      const fileName = `./propertyFloorPlans/${response}_${new Date().toJSON().split('T')[0]}.json`

      fs.mkdir('./propertyFloorPlans', e => {
        if (e?.code === 'EEXIST') console.log('Folder already exists.');
        else console.log(`propertyFloorPlans folder created successfully.`);
      })
      fs.mkdir('./floorPlanAvgs', e => {
        if (e?.code === 'EEXIST') console.log('Folder already exists.');
        else console.log(`floorPlanAvgs folder created successfully.`);
      })

      fs.writeFile(fileName, JSON.stringify(res), (e) => {
        console.log(e);
      })
      console.log(`\nCity file successfully created. See file at ${fileName}.\n`);

      console.log(`Parsing Property data...`);
      const allAverages = dataParser(res);

      fs.writeFile(`./floorPlanAvgs/${response}_${new Date().toJSON().split('T')[0]}.json`, JSON.stringify(allAverages), (e) => {
        console.log(e);
      })
      console.log(`\nAverage file written. See file at ./floorPlanAvgs/${response}_${new Date().toJSON().split('T')[0]}.json.`);
      console.log('\n\nExiting now. Goodbye!');
    } catch (e) {
      console.log(`Could not write file`, e);
    }
  });
  rl.close();
});


