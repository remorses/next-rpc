import * as path from 'path';
import puppeteer, { Browser } from 'puppeteer';
import { buildNext, startNext, cleanup, RunningNextApp } from './utils';

const FIXTURE_PATH = path.resolve(__dirname, './__fixtures__/basePath');

afterAll(() => cleanup(FIXTURE_PATH));

describe('basic-app', () => {
  let browser: Browser;
  let app: RunningNextApp;

  beforeAll(async () => {
    await Promise.all([
      buildNext(FIXTURE_PATH),
      puppeteer.launch().then((b) => (browser = b)),
    ]);
    app = await startNext(FIXTURE_PATH);
  }, 30000);

  afterAll(async () => {
    await Promise.all([browser && browser.close(), app && app.kill()]);
  });

  test('should call the rpc method on a basePath', async () => {
    const page = await browser.newPage();
    try {
      await page.goto(new URL('/hello/world', app.url).toString());
      const ssrData = await page.$eval('#ssr', (el) => el.textContent);
      expect(ssrData).toBe('foo bar');
      await page.waitForSelector('#browser');
      const browserData = await page.$eval('#browser', (el) => el.textContent);
      expect(browserData).toBe('baz quux');
    } finally {
      await page.close();
    }
  });
});
