import readline from 'readline';
import scrapeSite from './src/siteScraper';

const locationRegex = /^([a-z]-?){1,40}[-]{1}?([a-z]){1,2}$/g;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('What location do you want to search?\n', response => {
  if (locationRegex.test(response)) {
    scrapeSite(`https://www.apartments.com/${response.toLowerCase()}/`, response.toLowerCase())
    rl.close();
  } else {
    console.log('Incorrect Format. Try again!');
    rl.close();
  }
});