const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const cors = require('cors');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });



(async () =>{
app.use(cors({methods:['GET','POST']}));
app.use(express.json());    
app.use(express.static('public'));  
const delay = ms => new Promise(r => setTimeout(r,ms));
const cords = {x: 0, y:0, type: 'none'}


let page = null;
let browser = null;
let timer = null;
wss.on('connection',async (ws) => {
  console.log('Новое подключение WebSocket');
  ws.on('close', async (raw) => {
    clearInterval(timer)
    console.log('disconect')
    await browser.close();
  })
  ws.on('message', async (raw) => {
    const message = JSON.parse(raw.toString() == 'undefined' ? '{"error":0}' : raw.toString());
    
    console.log(message)
    if(message.type == 'click'){
      await page.mouse.click(message.x, message.y);      
    }
    
    if(message.type == 'wheel'){
      await page.mouse.move(message.x, message.y);
      await page.mouse.wheel({deltaY: message.deltaY});     
    }
    if(message.type == 'input'){
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
        await page.keyboard.press('Delete');
        await page.keyboard.type(message.txt);                
    }
    
    if(message.type == 'connect'){
      console.log('+')
      browser = await puppeteer.launch({ headless: true,  args: [
    '--enable-notifications',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage', 
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process', 
    '--disable-gpu'
  ] });
  page = await browser.newPage();
  await page.goto(message.url);
  await page.setViewport({ width: message.width, height: message.height});
    
    
  
   
  timer = setInterval(async () =>{
    const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: message.quality});
    await ws.send(screenshotBuffer);
  }, 0);
}
    
  });
});

  


app.get('/sleep', async (req, res) => {
  res.send({ type: true });
});
app.post('/sleep', async (req, res) => {
  res.send({ type: true });
});


  
app.listen('3000', err => { err ? err : console.log('STARTD SERVER') });

})()