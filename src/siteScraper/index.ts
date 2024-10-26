import dotenv from 'dotenv';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { JSDOM } from 'jsdom';
import { IFloorPlan, IProperty } from '../../Interfaces';
import { delay } from '../../utils';

dotenv.config();
puppeteer.use(StealthPlugin());

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
async function subSites(url: string, city?: string): Promise<IProperty | undefined> {
  try {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--disable-http2']
    });
    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000
    })

    const html = await page.content();

    const dom = new JSDOM(html);

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
          flrPlnObj.details.push(detailsObj);
        }
        allFlrPlns.push(flrPlnObj);
      }
      property.floorPlans = allFlrPlns;
      return property;
    } else {
      console.log('Something went wrong?');
      return undefined;
    }
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

/**
 * Used to grab urls of each property in given siteUrl then loop through each url and scrape data per property
 * 
 * @param siteURL 
 * @param city 
 */
export default async function scrapeSite(siteURL: string, city?: string): Promise<IProperty[]> {
  try {
    const propertyURLArr: any = [];
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--disable-http2']
    });
    const page = await browser.newPage();

    await page.goto(siteURL, {
      waitUntil: 'networkidle2',
      timeout: 60000
    })

    const html = await page.content();

    const dom = new JSDOM(html);

    const placardArr = dom.window.document.querySelectorAll(".placard");

    for (const placard of placardArr) {
      propertyURLArr.push(placard.getAttribute('data-url'));
    }

    const subSitePromises = propertyURLArr.map(async (property: string) => {
      delay(1_000, 3_000);
      const scrapedProperty = subSites(property);
      return scrapedProperty;
    })

    const allProperties = await Promise.all(subSitePromises);
    
    return allProperties.filter(property => property !== undefined) as IProperty[];
  } catch (e) {
    throw(e);
  }
}