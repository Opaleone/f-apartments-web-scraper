import https from 'https';
import * as cheerio from 'cheerio';
import readline from 'readline';

let analysisData: object[] = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const createOptions = (encodedURL: string): object => {
  return {
    hostname: 'api.crawlbase.com',
    path: '/?token=APldvMy6BM0m8AX4URkWuA&format=html&url=' + encodedURL
  }
}

function scrapeSite(siteURL: string): void {
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

        for (const url of propertyURLArr) {
          console.log(url);
        }

        // subSites(propertyURLArr);
      });
    }).end();
  } catch (e) {
    console.error(e);
  }
}

// function subSites(urlArr: string[]): void {
//   try {
//     // for (const url of urlArr) {
//     //   const encodedURL = encodeURIComponent(url);
//     //   https.request(createOptions(encodedURL), res => {
//     //     let body = '';
//     //     res.on('data', chunk => body += chunk).on('end', () => {
//     //       const sub$ = cheerio.load(body);
//     //       console.log(sub$);
//     //     })
//     //   })
//     // }

//     const encodedURL = encodeURIComponent(urlArr[0]);
//     console.log(encodedURL);
//     https.request(createOptions(encodedURL), res => {
//       let body = '';
//       res.on('data', chunk => body += chunk).on('end', () => {
//         const sub$ = cheerio.load(body);
//         console.log(sub$);
//       })
//     })
//   } catch (e) {
//     console.error(e);
//   }
// }

const locationRegex = /([a-z]){0,256}-([a-z]){2}/g

rl.question('What location do you want to search?\n', response => {
  if (locationRegex.test(response)) {
    scrapeSite(`https://www.apartments.com/${response.toLowerCase()}/`)
    rl.close();
  } else {
    console.log('Incorrect Format. Try again!');
    rl.close();
  }
});