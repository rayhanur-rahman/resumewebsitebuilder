const {Builder, By, until} = require('selenium-webdriver');

require('dotenv').config();

const loginEmail = process.env.SLACK_EMAIL;
const loginPassword = process.env.SLACK_PWD;
const slackSpaceUrl = 'https://northcarolina-s8o7157.slack.com';

async function example() {
    var hello;
    let driver = await new Builder().forBrowser("firefox").build();
    await driver.get(`${slackSpaceUrl}`);
    await driver.findElement(By.id('email')).sendKeys(loginEmail);
    await driver.findElement(By.id('password')).sendKeys(loginPassword);
    await driver.findElement(By.class('signin_btn')).sendKeys(Keys.ENTER);
    console.log(hello);
}   
example()
    /*
(async () => {

    const browser = await puppeteer.launch({headless: false, args: ["--no-sandbox", "--disable-web-security"]});
    let page = await login( browser, `${mattermostUrl}/login` );
    await postMessage(page, "Hello world from browser automation" );
  
    // const html = await page.content(); // serialized HTML of page DOM.
    // browser.close();
  })()*/