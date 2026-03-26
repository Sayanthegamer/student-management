import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Mobile viewport
        context = await browser.new_context(viewport={'width': 375, 'height': 667})
        page = await context.new_page()

        await page.goto('http://localhost:5173/login')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='mobile_login.png')

        await browser.close()

asyncio.run(run())
