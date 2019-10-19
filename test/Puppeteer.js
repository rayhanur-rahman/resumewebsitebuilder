const puppeteer = require('puppeteer')

require('dotenv').config();

const loginEmail = process.env.SLACK_EMAIL;
const loginPassword = process.env.SLACK_PWD;
const slackSpaceUrl = 'https://northcarolina-s8o7157.slack.com' 

async function login(browser, url) {
  const page = await browser.newPage();

  await page.goto(url, {waitUntil: 'networkidle0'});

  // Login
  await page.type('input[id=email]', loginEmail);
  await page.type('input[id=password]', loginPassword);
  //await page.click('button[id=signin_btn]');
  await page.keyboard.press('Enter');
  // Wait for redirect
  await page.waitForNavigation();
  return page;
}
async function OpenBotChannel(page){
  await page.goto(`${slackSpaceUrl}/messages/DNEF6M30V`,{waitUntil: 'networkidle0'});
  return page;
}

async function postMessage(page, msg)
{
  // Waiting for page to load
  await page.waitForSelector("#msg_input");

  // Focus on post textbox and press enter.
  await page.focus('#post_textbox')
  await page.keyboard.type( msg );
  await page.keyboard.press('Enter');
}

function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

(async () => {
  //Connecting the browser and redirecting to Slack Space
  const browser = await puppeteer.launch({headless: false, args: ["--no-sandbox", "--disable-web-security"]});
  let page = await login( browser, `${slackSpaceUrl}` );
  //Go to chatting page with bot
  page = await OpenBotChannel(page);
  //Chatting with bot
  await page.keyboard.type("Hello");
  await page.keyboard.press('Enter');
  //await postMessage(page, "start");
  //const example = await page.evaluate(element => {
  //  return element.textContent;
  //}, 
  //Delay for waiting for page to render
  await delay(4000);
  const title = await page.$x("//span[@class='c-message__body' and @data-qa='message-text']");

  for(var i=0; i<title.length; i++){
    let messages = await page.evaluate(span => span.textContent, title[i]);
    console.log(messages); 
  }
  //UseCase 1
  await page.keyboard.type("start");
  await delay(4000);

  const title1 = await page.$x("//span[@class='c-message__body' and @data-qa='message-text']");

  let messages = await page.evaluate(span => span.textContent, title1[title1.length-1]);
   
  


    // const html = await page.content(); // serialized HTML of page DOM.
  // browser.close();
})()


// Pretend you are a iPhone X
//await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1');
//await page.setViewport({ width: 375, height: 812 });