import dotenv from 'dotenv';
import https from 'https';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import { IFloorPlan, IProperty } from '../../Interfaces';
dotenv.config();

const allProperties: IProperty[] = [];

/**
 * Creates options object for https request
 * ```ts
 * return {
 *  hostname,
 *  path
 * }
 * ```
 * @param encodedURL string
 * @returns object
 */
export const createOptions = (encodedURL: string): object => {
  return {
    hostname: 'api.crawlbase.com',
    path: `/?token=${process.env.TOKEN}&format=html&url=` + encodedURL
  }
}

/**
 * Executes a https request for a property within Apartments.com/{city}/
 * 
 * @param url string
 * @param city string
 */
function subSites(url: string, city: string): void {
  try {
    const encodedURL = encodeURIComponent(url);
    https.request(createOptions(encodedURL), res => {
      let body = '';
      res.on('data', chunk => body += chunk).on('end', () => {
        const $ = cheerio.load(body);
        const dom = new JSDOM($.html());

        const diffFlrPlans = dom.window.document.querySelector('[data-tab-content-id="all"')?.querySelectorAll('.pricingGridItem.multiFamily.hasUnitGrid');

        const propertyAddress = {
          address: dom.window.document.querySelector(".propertyAddressContainer")?.querySelector('.delivery-address')?.childNodes[0].textContent?.trim(),
          city: dom.window.document.querySelector(".propertyAddressContainer")?.childNodes[1].childNodes[3].textContent?.trim(),
          state: dom.window.document.querySelector(".propertyAddressContainer")?.querySelector('.stateZipContainer')?.childNodes[1].textContent?.trim(),
          zip: dom.window.document.querySelector(".propertyAddressContainer")?.querySelector('.stateZipContainer')?.childNodes[3].textContent?.trim()
        }

        const property: IProperty = {
          propertyName: dom.window.document.querySelector("#propertyName")?.textContent?.trim(),
          address: `${propertyAddress.address}, ${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zip}`,
          floorPlans: []
        }

        if (diffFlrPlans) {
          const allFlrPlns: IFloorPlan[] = [];
          for (let i = 0; i < diffFlrPlans.length; i++) {
            const flrPlnObj: IFloorPlan = {
              name: diffFlrPlans[i].querySelector('.modelLabel')?.childNodes[1].textContent?.trim() ?? undefined,
              beds: diffFlrPlans[i].querySelector('.detailsLabel')?.childNodes[1].childNodes[1].textContent?.trim() ?? undefined,
              baths: diffFlrPlans[i].querySelector('.detailsLabel')?.childNodes[1].childNodes[3].textContent?.trim() ?? undefined,
              details: []
            }
            for (let j = 0; j < diffFlrPlans[i].querySelectorAll('.unitContainer.js-unitContainer').length; j++) {
              const detailsObj = {
                price: diffFlrPlans[i].querySelectorAll('.pricingColumn.column')[j].childNodes[3].textContent?.trim() ?? undefined,
                sqFt: `${diffFlrPlans[i].querySelectorAll('.sqftColumn.column')[j].childNodes[3].textContent?.trim() ?? undefined} square feet`,
                whenAvailable: diffFlrPlans[i].querySelectorAll('.dateAvailable')[j].childNodes[2].textContent?.trim() ?? undefined,
              }
              flrPlnObj.details.push(detailsObj)
            }
            allFlrPlns.push(flrPlnObj)
          }

          property.floorPlans = allFlrPlns;
          allProperties.push(property);
        } else {
          console.log('Something went wrong?');
        }
      })
    }).end();
  } catch (e) {
    console.error(e);
  }
}

/**
 * Used to grab urls of each property in given siteUrl then loop through each url and scrape data per property
 * 
 * @param siteURL 
 * @param city 
 */
export default function scrapeSite(siteURL: string, city: string): IProperty[] {
  try {
    const propertyURLArr: any = [];
    let encodedURL = encodeURIComponent(siteURL);

    https.request(createOptions(encodedURL), (res) => {
      let body = '';
      res.on('data', chunk => body += chunk).on('end', () => {
        const $ = cheerio.load(body);
        $('ul li article').each((i, element) => {
          if ($(element).attr('data-url')) {
            propertyURLArr.push($(element).attr('data-url'));
          }
        })

        for (const property of propertyURLArr) {
          subSites(property, city);
        }
      });
    }).end();
    return allProperties;
  } catch (e) {
    throw(e);
  }
}