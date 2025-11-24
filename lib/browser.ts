import { chromium, Browser, Page, BrowserContext } from 'playwright';

let browserInstance: Browser | null = null;
let contextInstance: BrowserContext | null = null;

/**
 * Get or create a browser instance (singleton pattern)
 */
export async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserInstance;
}

/**
 * Get or create a browser context (singleton pattern)
 */
export async function getBrowserContext(): Promise<BrowserContext> {
  if (!contextInstance) {
    const browser = await getBrowser();
    contextInstance = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
  }
  return contextInstance;
}

/**
 * Create a new page in the browser context
 */
export async function createPage(): Promise<Page> {
  const context = await getBrowserContext();
  return await context.newPage();
}

/**
 * Navigate to a URL and wait for the page to load
 */
export async function navigateTo(url: string, options?: {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  timeout?: number;
}): Promise<Page> {
  const page = await createPage();
  await page.goto(url, {
    waitUntil: options?.waitUntil || 'networkidle',
    timeout: options?.timeout || 30000,
  });
  return page;
}

/**
 * Take a screenshot of a page
 */
export async function takeScreenshot(page: Page, path?: string): Promise<Buffer> {
  return await page.screenshot({
    path,
    fullPage: true,
  });
}

/**
 * Get page content (HTML)
 */
export async function getPageContent(page: Page): Promise<string> {
  return await page.content();
}

/**
 * Get page title
 */
export async function getPageTitle(page: Page): Promise<string> {
  return await page.title();
}

/**
 * Wait for an element to appear
 */
export async function waitForElement(
  page: Page,
  selector: string,
  options?: { timeout?: number; visible?: boolean }
): Promise<void> {
  await page.waitForSelector(selector, {
    timeout: options?.timeout || 30000,
    state: options?.visible ? 'visible' : 'attached',
  });
}

/**
 * Click on an element
 */
export async function clickElement(page: Page, selector: string): Promise<void> {
  await page.click(selector);
}

/**
 * Type text into an input field
 */
export async function typeText(page: Page, selector: string, text: string): Promise<void> {
  await page.fill(selector, text);
}

/**
 * Get text content of an element
 */
export async function getTextContent(page: Page, selector: string): Promise<string | null> {
  return await page.textContent(selector);
}

/**
 * Get attribute value of an element
 */
export async function getAttribute(page: Page, selector: string, attribute: string): Promise<string | null> {
  return await page.getAttribute(selector, attribute);
}

/**
 * Evaluate JavaScript in the page context
 */
export async function evaluateScript<T>(page: Page, script: string | Function): Promise<T> {
  return await page.evaluate(script as any);
}

/**
 * Wait for navigation
 */
export async function waitForNavigation(page: Page, options?: { timeout?: number; url?: string | RegExp }): Promise<void> {
  await page.waitForURL(options?.url || /.*/, {
    timeout: options?.timeout || 30000,
  });
}

/**
 * Close a page
 */
export async function closePage(page: Page): Promise<void> {
  await page.close();
}

/**
 * Close browser and context (cleanup)
 */
export async function closeBrowser(): Promise<void> {
  if (contextInstance) {
    await contextInstance.close();
    contextInstance = null;
  }
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Scrape data from a page using a selector
 */
export async function scrapeData<T>(
  page: Page,
  selector: string,
  extractor: (element: Element) => T
): Promise<T[]> {
  return await page.$$eval(selector, (elements, extractorFn) => {
    return Array.from(elements).map(extractorFn);
  }, extractor as any);
}

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page, timeout: number = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Get all cookies
 */
export async function getCookies(page: Page): Promise<any[]> {
  return await contextInstance?.cookies() || [];
}

/**
 * Set cookies
 */
export async function setCookies(page: Page, cookies: any[]): Promise<void> {
  await contextInstance?.addCookies(cookies);
}

