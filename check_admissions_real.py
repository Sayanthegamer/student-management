import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Mobile viewport
        context = await browser.new_context(viewport={'width': 375, 'height': 667})
        page = await context.new_page()

        # Set up auth mock
        await page.add_init_script("""
            window.localStorage.setItem('sb-supabase-auth-token', JSON.stringify({
                user: { id: '1', email: 'test@example.com' },
                session: { access_token: 'fake', refresh_token: 'fake' }
            }));
        """)

        await page.goto('http://localhost:5173/dashboard')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='mobile_dashboard.png')

        await page.goto('http://localhost:5173/admissions')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='mobile_admissions_real.png')

        await browser.close()

asyncio.run(run())
