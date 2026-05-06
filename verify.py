import asyncio
from playwright.async_api import async_playwright
import json

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        # Verify the CSP headers by opening a local file or standard domain
        await page.goto("http://localhost:5173", wait_until="networkidle")

        # Checking manifest existence by fetching it
        response = await page.request.get("http://localhost:5173/manifest.json")
        if response.status != 200:
            print("manifest.json not loaded correctly")

        try:
            manifest_json = await response.json()
            if manifest_json.get("name") == "Kinetic Ledger":
                print("Manifest loaded and parsed successfully")
        except Exception as e:
            print("Failed to parse manifest JSON", e)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
