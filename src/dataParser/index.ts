import data from '../../propertyFloorplans/georgetown-tx_2024-10-06.json';
import currencyToNumber from '../../utils';

// data: object[]

/**
 * Used to parse through gathered apartment data and calculate average price for each floorplan according to square footage
 * @params Array of floorplans
 * @returns Array of averages of floorplans
 */
export default function dataParser() {
  const allAverages: any = [];

  for (let i = 0; i < data.length; i++) {
    let curProperty: any = {
      propertyName: data[i].propertyName,
      address: data[i].address,
      floorPlans: []
    }

    for (const floorPlan of data[i].floorPlans) {
      let floorPlanObj: any = {
        floorplanName: floorPlan.name,
        beds: floorPlan.beds,
        baths: floorPlan.baths,
        averages: []
      }

      let tempObj = {
        total: 0,
        count: 0,
        sqFt: floorPlan.details[0].sqFt
      }

      for (let j = 0; j < floorPlan.details.length; j++) {
        if (floorPlan.details[j].sqFt !== tempObj.sqFt || j === floorPlan.details.length - 1) {
          const detailPrep = {
            avg: tempObj.total / tempObj.count,
            sqFt: tempObj.sqFt
          }

          floorPlanObj.averages.push(detailPrep);

          tempObj.total = currencyToNumber(floorPlan.details[j].price);
          tempObj.count = 1;
          tempObj.sqFt = floorPlan.details[j].sqFt;
        }

        tempObj.total += currencyToNumber(floorPlan.details[j].price);
        tempObj.count++;
      }
      curProperty.floorPlans.push(floorPlanObj);
    }
    allAverages.push(curProperty);
  }
  return allAverages;
}