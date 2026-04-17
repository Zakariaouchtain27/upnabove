const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3456');
  
  const containerStyle = await page.evaluate(() => {
    const el = document.querySelectorAll('.section-container')[2]; // 3rd one should be features
    const computed = window.getComputedStyle(el);
    return {
      width: computed.width,
      maxWidth: computed.maxWidth,
      marginLeft: computed.marginLeft,
      marginRight: computed.marginRight,
      display: computed.display,
      paddingLeft: computed.paddingLeft,
      className: el.className
    };
  });
  console.log('Container Style:', containerStyle);
  
  await browser.close();
})();
