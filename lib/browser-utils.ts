/**
 * Browser utility functions for common web scraping and automation tasks
 */

import {
  navigateTo,
  getPageContent,
  getTextContent,
  getAttribute,
  clickElement,
  typeText,
  waitForElement,
  scrapeData,
  evaluateScript,
  closePage,
  Page,
} from './browser';

/**
 * Scrape a list of items from a page
 */
export async function scrapeList<T>(
  url: string,
  itemSelector: string,
  extractor: (element: Element) => T
): Promise<T[]> {
  const page = await navigateTo(url);
  try {
    const items = await scrapeData(page, itemSelector, extractor);
    return items;
  } finally {
    await closePage(page);
  }
}

/**
 * Extract text from multiple elements
 */
export async function extractTexts(
  url: string,
  selector: string
): Promise<string[]> {
  const page = await navigateTo(url);
  try {
    const texts = await page.$$eval(selector, (elements) =>
      elements.map((el) => el.textContent?.trim() || '')
    );
    return texts.filter((text) => text.length > 0);
  } finally {
    await closePage(page);
  }
}

/**
 * Extract links from a page
 */
export async function extractLinks(
  url: string,
  baseSelector?: string
): Promise<Array<{ text: string; href: string }>> {
  const page = await navigateTo(url);
  try {
    const selector = baseSelector ? `${baseSelector} a` : 'a';
    const links = await page.$$eval(selector, (elements) =>
      elements.map((el) => ({
        text: el.textContent?.trim() || '',
        href: (el as HTMLAnchorElement).href || '',
      }))
    );
    return links.filter((link) => link.href.length > 0);
  } finally {
    await closePage(page);
  }
}

/**
 * Fill a form and submit it
 */
export async function fillAndSubmitForm(
  url: string,
  formData: Record<string, string>,
  submitSelector?: string
): Promise<Page> {
  const page = await navigateTo(url);
  
  // Fill all form fields
  for (const [selector, value] of Object.entries(formData)) {
    await typeText(page, selector, value);
  }
  
  // Submit the form
  if (submitSelector) {
    await clickElement(page, submitSelector);
  } else {
    // Try to find and click submit button
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) {
          (submitButton as HTMLElement).click();
        }
      }
    });
  }
  
  // Wait for navigation
  await page.waitForLoadState('networkidle');
  
  return page;
}

/**
 * Wait for and extract data when a selector appears
 */
export async function waitAndExtract<T>(
  url: string,
  selector: string,
  extractor: (element: Element) => T,
  timeout: number = 30000
): Promise<T[]> {
  const page = await navigateTo(url);
  try {
    await waitForElement(page, selector, { timeout });
    const items = await scrapeData(page, selector, extractor);
    return items;
  } finally {
    await closePage(page);
  }
}

/**
 * Execute custom JavaScript on a page
 */
export async function executeScript<T>(
  url: string,
  script: string | Function
): Promise<T> {
  const page = await navigateTo(url);
  try {
    return await evaluateScript<T>(page, script);
  } finally {
    await closePage(page);
  }
}

/**
 * Get meta tags from a page
 */
export async function getMetaTags(url: string): Promise<Record<string, string>> {
  const page = await navigateTo(url);
  try {
    const metaTags = await page.$$eval('meta', (elements) => {
      const tags: Record<string, string> = {};
      elements.forEach((el) => {
        const name = el.getAttribute('name') || el.getAttribute('property');
        const content = el.getAttribute('content');
        if (name && content) {
          tags[name] = content;
        }
      });
      return tags;
    });
    return metaTags;
  } finally {
    await closePage(page);
  }
}

/**
 * Check if an element exists on the page
 */
export async function elementExists(
  url: string,
  selector: string
): Promise<boolean> {
  const page = await navigateTo(url);
  try {
    const element = await page.$(selector);
    return element !== null;
  } finally {
    await closePage(page);
  }
}

