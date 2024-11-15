import { IDetails, IProperty } from '../../Interfaces';
import { currencyToNumber } from '../../utils';
import { styleText } from 'node:util';

/**
 * Used to parse through gathered apartment data and calculate average price for each floorplan according to square footage
 * @params Array of floorplans
 * @returns Array of averages of floorplans
 */
export default function dataParser(data: IProperty[] | undefined, cityName: string) {
  if (!data) return;

  const allAverages: IProperty[] = [];

  console.log(`Calculating averages for ${cityName}`);
  
  for (let i = 0; i < data.length; i++) {
    if (!data[i]) continue;

    console.log(`Parsing ${data[i].propertyName}`);

    let curProperty: IProperty = {
      propertyName: data[i].propertyName,
      address: data[i].address,
      phone: data[i].phone,
      leasingOffice: data[i].leasingOffice,
      floorPlans: []
    };

    for (const floorPlan of data[i].floorPlans) {
      let floorPlanObj: any = {
        floorplanName: floorPlan.name,
        beds: floorPlan.beds,
        baths: floorPlan.baths,
        averages: []
      };

      // Sort details by square footage
      floorPlan.details.sort((a: IDetails, b: IDetails): number => {
        const aSqFt = a.sqFt ? parseInt(a.sqFt.split(' ')[0]) : 0;
        const bSqFt = b.sqFt ? parseInt(b.sqFt.split(' ')[0]) : 0;

        return bSqFt - aSqFt;
      });

      // Initialize temporary object
      let tempObj = {
        total: currencyToNumber(floorPlan.details[0].price),
        count: 1,
        sqFt: floorPlan.details[0].sqFt,
        whenAvailable: floorPlan.details[0].whenAvailable
      };

      for (let j = 1; j < floorPlan.details.length; j++) {
        const price = currencyToNumber(floorPlan.details[j].price);
        const sqFt = floorPlan.details[j].sqFt;
        const whenAvailable = floorPlan.details[j].whenAvailable

        if (isNaN(price)) continue;

        if (sqFt !== tempObj.sqFt || whenAvailable !== tempObj.whenAvailable) {
          // Push the current group's average
          floorPlanObj.averages.push({
            avgPrice: Math.round(tempObj.total / tempObj.count),
            sqFt: tempObj.sqFt,
            whenAvailable: tempObj.whenAvailable
          });

          // Reset tempObj for the new group
          tempObj = {
            total: price,
            count: 1,
            sqFt: sqFt,
            whenAvailable: whenAvailable
          };
        } else {
          // Accumulate prices within the same square footage group
          tempObj.total += price;
          tempObj.count++;
        }
      }
      // Push the last calculated average
      floorPlanObj.averages.push({
        avgPrice: Math.round(tempObj.total / tempObj.count),
        sqFt: tempObj.sqFt,
        whenAvailable: tempObj.whenAvailable
      });

      console.log(`Pushing averages for ${floorPlan.name}`);

      curProperty.floorPlans.push(floorPlanObj);
    }

    console.log(styleText(['green'], `Pushing averages for ${curProperty.propertyName}`));
    allAverages.push(curProperty);
  }

  console.log(styleText(['green'], `Successfully parsed ${data.length} properties.`));
  return allAverages;
}