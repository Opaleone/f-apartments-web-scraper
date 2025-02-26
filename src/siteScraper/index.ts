import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { JSDOM } from 'jsdom';
import { IFloorPlan, IProperty } from '../../Interfaces';
import { delay } from '../../utils';
import { Page } from 'puppeteer';
import { styleText } from 'node:util';
puppeteer.use(StealthPlugin());

/**
 * Executes a https request for a property within https://www.apartments.com/{city}/
 * 
 * @param url string
 * @param page Instance of Page from puppeteer
 */
async function subSites(url: string, page: Page): Promise<IProperty | undefined> {
  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000
    });

    const html = await page.content();

    if (html) console.log(styleText(['green'], `Content found!\n`));

    const dom = new JSDOM(html);

    const diffFlrPlans = dom.window.document.querySelector('[data-tab-content-id="all"')?.querySelectorAll('.pricingGridItem.multiFamily.hasUnitGrid');
    const uniqueFeaturesArr = dom.window.document.querySelector('.uniqueFeatures')?.querySelectorAll('.uniqueAmenity');

    const propertyAddress = {
      address: dom.window.document.querySelector(".propertyAddressContainer")?.querySelector('.delivery-address')?.childNodes[0].textContent?.trim(),
      city: dom.window.document.querySelector(".propertyAddressContainer")?.childNodes[1].childNodes[3].textContent?.trim(),
      state: dom.window.document.querySelector(".propertyAddressContainer")?.querySelector('.stateZipContainer')?.childNodes[1].textContent?.trim(),
      zip: dom.window.document.querySelector(".propertyAddressContainer")?.querySelector('.stateZipContainer')?.childNodes[3].textContent?.trim()
    }

    const property: IProperty = {
      propertyName: dom.window.document.querySelector("#propertyName")?.textContent?.trim(),
      address: `${propertyAddress.address}, ${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zip}`,
      phone: dom.window.document.querySelector(".phoneNumber")?.textContent?.split(' ').join(''),
      leasingOffice: dom.window.document.querySelector(".leasingOfficeAddressContainer")?.childNodes[3].textContent?.trim(),
      floorplans: [],
      uniqueFeatures: []
    }

    if (diffFlrPlans) {
      console.log(`Grabbing property information for ${property.propertyName}...`);
      
      const allFlrPlns: IFloorPlan[] = [];
      for (let i = 0; i < diffFlrPlans.length; i++) {
        const flrPlnObj: IFloorPlan = {
          name: diffFlrPlans[i].querySelector('.modelLabel')?.childNodes[1].textContent?.trim() ?? undefined,
          beds: diffFlrPlans[i].querySelector('.detailsLabel')?.childNodes[1].childNodes[1].textContent?.trim() ?? undefined,
          baths: diffFlrPlans[i].querySelector('.detailsLabel')?.childNodes[1].childNodes[3].textContent?.trim() ?? undefined,
          details: []
        }
        console.log(`Grabbing details for ${flrPlnObj.name} floorplan...`)
        for (let j = 0; j < diffFlrPlans[i].querySelectorAll('.unitContainer.js-unitContainerV3').length; j++) {
          console.log(`Found details for ${flrPlnObj.name} with sqft: ${diffFlrPlans[i].querySelectorAll('.sqftColumn.column')[j].childNodes[3].textContent?.trim()}`);
          const detailsObj = {
            price: diffFlrPlans[i].querySelectorAll('.pricingColumn.column')[j].childNodes[3].textContent?.trim() ?? undefined,
            sqFt: `${diffFlrPlans[i].querySelectorAll('.sqftColumn.column')[j].childNodes[3].textContent?.trim() ?? undefined} square feet`,
            whenAvailable: diffFlrPlans[i].querySelectorAll('.dateAvailable')[j].childNodes[2].textContent?.trim() ?? undefined,
          }
          flrPlnObj.details.push(detailsObj);
        }
        console.log('Pushing details...');
        allFlrPlns.push(flrPlnObj);
      }

      if (uniqueFeaturesArr) {
        for (const feature of uniqueFeaturesArr) {
          if (feature?.textContent?.trim()) {
            property.uniqueFeatures?.push(feature.textContent.trim())
          }
        }
      }

      console.log(styleText(['green'], `Pushing ${property.propertyName} information`));
      property.floorplans = allFlrPlns;
      return property;
    } else {
      console.log(styleText(['yellow', 'underline'], `Properties not found for ${url}`));
      return undefined;
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * Used to grab urls of each property in given siteUrl then loop through each url and scrape data per property
 * 
 * @param siteURL
 */
export default async function scrapeSite(siteURL: string): Promise<IProperty[] | undefined> {
  try {
    const propertyURLArr: any = [];
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--disable-http2']
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', req => {
      if (req.resourceType() === 'image') req.abort();
      else req.continue();
    })

    let allProperties: any = []

    await page.goto(siteURL, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000
    })

    const html = await page.content();

    if (html) console.log(styleText(['green'], '\nHTML Content found!\n'));

    const dom = new JSDOM(html);

    const placardArr = dom.window.document.querySelectorAll(".placard");

    if (!placardArr.length) return;
    else console.log('Properties acquired. Grabbing their URLs now...\n');

    for (const placard of placardArr) propertyURLArr.push(placard.getAttribute('data-url'));

    if (propertyURLArr) console.log('URLs secured. Checking each URL now...\n');

    for (let i = 0; i < propertyURLArr.length; i++) {
      console.log(`Checking ${propertyURLArr[i]}`);
      await delay(1_000, 3_000);
      const idvProperty = await subSites(propertyURLArr[i], page);
      allProperties.push(idvProperty);
    }
    browser.close();
    return allProperties;
  } catch (e) {
    throw(e);
  }
}