import axios from 'axios';
import { styleText } from 'node:util';
import { formatCity, welcome } from './utils';
import scrapeSite from './src/siteScraper';
import dataParser from './src/dataParser';
import { input } from '@inquirer/prompts';

const locationRegex = /^([a-z]-?){1,40}[-]{1}?([a-z]){1,2}$/g;
const baseURL = 'http://localhost:3001/api';

console.log(styleText(['green'], welcome));

(async () => {
  const city = await input({ message: "What location do you want to search?" }, { clearPromptOnDone: true });

  if (!locationRegex.test(city)) {
    throw new Error('Incorrect Format. Try again!');
  }

  const cityStateArr = formatCity(city);

  const searchExist = await axios.get(`${baseURL}/city/check`, {
    params: {
      cityName: cityStateArr[0],
      state: cityStateArr[1]
    }
  })

  if (searchExist) {
    console.log(searchExist.data);
    return;
  }

  scrapeSite(`https://www.apartments.com/${city}/`).then(async (res) => {
    if (!res) {
      throw new Error('No Properties found!');
    }

    console.log('\n\nSaving to Database...\n');
    try {
      const propertyIds = [];
      
      for (let i = 0; i < res.length; i++) {
        const floorplanIds: string[] = [];

        for (let j = 0; j < res[i].floorplans.length; j++ ) {
          const curFloorplan = res[i].floorplans[j];
          const detailsIds: string[] = [];
          const averagesIds: string[] = [];
          const parsedProperty = dataParser(curFloorplan.details);

          for (let k = 0; k < parsedProperty.length; k++) {
            const average = await axios.post(`${baseURL}/averages/create`, {
              price: parsedProperty[k].price,
              sqFt: parsedProperty[k].sqFt,
              whenAvailable: parsedProperty[k].whenAvailable
            });
            averagesIds.push(average.data._id);
          }

          if (curFloorplan.details) {
            for (let k = 0; k < curFloorplan.details.length; k++) {
              const detail = await axios.post(`${baseURL}/details/create`, curFloorplan.details[k]);
  
              detailsIds.push(detail.data._id);
            }
          }
          const curFloorplanDB = await axios.post(`${baseURL}/floorplan/create`, {
            name: curFloorplan.name,
            beds: curFloorplan.beds,
            baths: curFloorplan.baths,
            details: detailsIds,
            averages: averagesIds
          })

          floorplanIds.push(curFloorplanDB.data._id);
        }

        const property = await axios.post(`${baseURL}/property/create`, {
          propertyName: res[i].propertyName,
          address: res[i].address,
          phone: res[i].phone,
          leasingOffice: res[i].leasingOffice,
          floorplans: floorplanIds
        })

        propertyIds.push(property.data._id);
      }

      const cityDB = await axios.post(`${baseURL}/city/create`, {
        cityName: cityStateArr[0],
        state: cityStateArr[1],
        properties: propertyIds
      })

      console.log(cityDB.data);

      if (cityDB) {
        console.log(styleText(['green'], `${cityDB.data.cityName}, ${cityDB.data.state} created with it's properties successfully!\n`))
      }

      console.log(styleText(['magentaBright'], `\n\nExiting now.\nGoodbye!`));
    } catch (e) {
      console.error(`Could not generate file(s): \n`, e);
    }
  });
})();