import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Force dynamic execution (optional but often needed for serverless)
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { html, filename } = body;

        if (!html) {
            return NextResponse.json({ error: 'Missing HTML content' }, { status: 400 });
        }

        let browser;

        if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
            // Production: Use @sparticuz/chromium
            console.log('PDF: Launching Puppeteer with @sparticuz/chromium');
            const executablePath = await chromium.executablePath();
            console.log('PDF: Executable Path:', executablePath);

            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: (chromium as any).defaultViewport || { width: 1920, height: 1080 },
                executablePath: executablePath,
                headless: (chromium as any).headless,
            });
        } else {
            // Development: Use local Chrome
            console.log('PDF: Launching Puppeteer with local Chrome');
            const { default: puppeteerLocal } = await import('puppeteer');
            browser = await puppeteerLocal.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
        }

        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: 'networkidle0',
        });

        await page.emulateMediaType('print');

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' },
        });

        await browser.close();

        return new NextResponse(pdfBuffer as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename || 'document.pdf'}"`,
            },
        });

    } catch (error: any) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF', details: error.message },
            { status: 500 }
        );
    }
}
