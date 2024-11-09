import { IDetails, IProperty } from '../../Interfaces';
import { currencyToNumber } from '../../utils';

/**
 * Used to parse through gathered apartment data and calculate average price for each floorplan according to square footage
 * @params Array of floorplans
 * @returns Array of averages of floorplans
 */
export default function dataParser(data: IProperty[]) {
  const allAverages: IProperty[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (!data[i]) continue;

    let curProperty: IProperty = {
      propertyName: data[i].propertyName,
      address: data[i].address,
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
        sqFt: floorPlan.details[0].sqFt
      };

      for (let j = 1; j < floorPlan.details.length; j++) {
        const price = currencyToNumber(floorPlan.details[j].price);
        const sqFt = floorPlan.details[j].sqFt;

        if (isNaN(price)) continue;

        if (sqFt !== tempObj.sqFt) {
          // Push the current group's average
          floorPlanObj.averages.push({
            avgPrice: tempObj.total / tempObj.count,
            sqFt: tempObj.sqFt
          });

          // Reset tempObj for the new group
          tempObj = {
            total: price,
            count: 1,
            sqFt: sqFt
          };
        } else {
          // Accumulate prices within the same square footage group
          tempObj.total += price;
          tempObj.count++;
        }
      }

      // Push the last calculated average
      floorPlanObj.averages.push({
        avgPrice: tempObj.total / tempObj.count,
        sqFt: tempObj.sqFt
      });

      curProperty.floorPlans.push(floorPlanObj);
    }

    allAverages.push(curProperty);
  }

  console.log(`Successfully parsed ${data.length} properties.`);
  return allAverages;
}