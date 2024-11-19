import { IAverageDetails, IDetails, IProperty } from '../../Interfaces';
import { currencyToNumber } from '../../utils';
import { styleText } from 'node:util';

/**
 * Used to parse through gathered apartment data and calculate average price for each floorplan according to square footage
 * @params Array of floorplans
 * @returns Array of averages of floorplans
 */
export default function dataParser(data: IDetails[]): IAverageDetails[] {
  const averages: IAverageDetails[] = [];

  // Initialize temporary object
  let tempObj = {
    total: currencyToNumber(data[0].price),
    count: 1,
    sqFt: data[0].sqFt,
    whenAvailable: data[0].whenAvailable
  };

  for (let i = 1; i < data.length; i++) {
    const price = currencyToNumber(data[i].price);
    const sqFt = data[i].sqFt;
    const whenAvailable = data[i].whenAvailable

    if (isNaN(price)) continue;

    if (sqFt !== tempObj.sqFt || whenAvailable !== tempObj.whenAvailable) {
      // Push the current group's average
      averages.push({
        price: Math.round(tempObj.total / tempObj.count),
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
  averages.push({
    price: Math.round(tempObj.total / tempObj.count),
    sqFt: tempObj.sqFt,
    whenAvailable: tempObj.whenAvailable
  });

  return averages;
}