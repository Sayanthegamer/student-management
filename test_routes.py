import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 375, 'height': 667})
        page = await context.new_page()

        # Try to bypass auth by using the same local storage mock that was in the code before
        await page.goto('http://localhost:5173/')

        # We need to set the mock user context, which depends on how the app uses it
        await page.evaluate("""() => {
            window.localStorage.setItem('student_management_data_v1', '{}');
            // Try different keys that supabase might use
            window.localStorage.setItem('supabase.auth.token', JSON.stringify({
                currentSession: { user: { id: '1' } },
                expiresAt: Math.floor(Date.now() / 1000) + 3600
            }));
        }""")

        await page.goto('http://localhost:5173/dashboard')
        await page.wait_for_timeout(2000)
        await page.screenshot(path='mobile_dash_attempt.png')

        await browser.close()

asyncio.run(run())
