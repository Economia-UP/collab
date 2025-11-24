import { NextRequest, NextResponse } from 'next/server';
import { navigateTo, getPageContent, getPageTitle, takeScreenshot, closePage, closeBrowser } from '@/lib/browser';

/**
 * API route for browser automation
 * POST /api/browser
 * 
 * Body:
 * {
 *   action: 'navigate' | 'screenshot' | 'content' | 'title',
 *   url?: string,
 *   selector?: string,
 *   options?: any
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, url, selector, options } = body;

    switch (action) {
      case 'navigate': {
        if (!url) {
          return NextResponse.json(
            { error: 'URL is required for navigate action' },
            { status: 400 }
          );
        }
        const page = await navigateTo(url, options);
        const title = await getPageTitle(page);
        const content = await getPageContent(page);
        await closePage(page);
        
        return NextResponse.json({
          success: true,
          title,
          contentLength: content.length,
          url: page.url(),
        });
      }

      case 'screenshot': {
        if (!url) {
          return NextResponse.json(
            { error: 'URL is required for screenshot action' },
            { status: 400 }
          );
        }
        const page = await navigateTo(url, options);
        const screenshot = await takeScreenshot(page);
        await closePage(page);
        
        return new NextResponse(screenshot, {
          headers: {
            'Content-Type': 'image/png',
          },
        });
      }

      case 'content': {
        if (!url) {
          return NextResponse.json(
            { error: 'URL is required for content action' },
            { status: 400 }
          );
        }
        const page = await navigateTo(url, options);
        const content = await getPageContent(page);
        await closePage(page);
        
        return NextResponse.json({
          success: true,
          content,
          url: page.url(),
        });
      }

      case 'title': {
        if (!url) {
          return NextResponse.json(
            { error: 'URL is required for title action' },
            { status: 400 }
          );
        }
        const page = await navigateTo(url, options);
        const title = await getPageTitle(page);
        await closePage(page);
        
        return NextResponse.json({
          success: true,
          title,
          url: page.url(),
        });
      }

      case 'search': {
        const { query } = body;
        if (!query) {
          return NextResponse.json(
            { error: 'Query is required for search action' },
            { status: 400 }
          );
        }
        
        // Search using Google
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        const page = await navigateTo(searchUrl, options);
        
        // Extract search results
        const results = await page.evaluate(() => {
          const resultElements = Array.from(document.querySelectorAll('div.g'));
          return resultElements.slice(0, 5).map((el) => {
            const titleEl = el.querySelector('h3');
            const linkEl = el.querySelector('a');
            const snippetEl = el.querySelector('span[style*="-webkit-line-clamp"]') || 
                            el.querySelector('.VwiC3b') ||
                            el.querySelector('span');
            
            return {
              title: titleEl?.textContent || '',
              url: linkEl?.href || '',
              snippet: snippetEl?.textContent || '',
            };
          }).filter(r => r.title && r.url);
        });
        
        const title = await getPageTitle(page);
        await closePage(page);
        
        return NextResponse.json({
          success: true,
          title,
          url: searchUrl,
          query,
          results: results.length > 0 ? results : [{
            title: `Búsqueda: ${query}`,
            url: searchUrl,
            snippet: 'Haz clic para ver los resultados completos en Google',
          }],
          content: results.map(r => `${r.title}\n${r.snippet}`).join('\n\n'),
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Browser API error:', error);
    return NextResponse.json(
      { error: error.message || 'Browser operation failed' },
      { status: 500 }
    );
  }
}

/**
 * Cleanup browser on shutdown
 */
export async function DELETE() {
  try {
    await closeBrowser();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to close browser' },
      { status: 500 }
    );
  }
}

