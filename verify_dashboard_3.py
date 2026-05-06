import asyncio
from playwright.async_api import async_playwright
import os
import json
from datetime import datetime

async def main():
    os.system("npm run build")
    os.system("npx vite preview --port 4175 > vite_output.log 2>&1 &")
    await asyncio.sleep(5)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 375, 'height': 812})
        page = await context.new_page()

        print("Setting mocked data...")
        await page.goto('http://localhost:4175/')
        await page.evaluate("""() => {
            localStorage.setItem('nst_skip_loading', 'true');
            localStorage.setItem('nst_student_guide_dismissed', 'true');
            localStorage.setItem('nst_system_settings', JSON.stringify({
                appName: 'Test App',
            }));
            localStorage.setItem('nst_current_user', JSON.stringify({
                id: 'student123',
                name: 'Test Student',
                role: 'STUDENT',
                subscriptionTier: 'FREE',
                subscriptionLevel: 'FREE',
                credits: 0,
                lastLoginRewardDate: new Date().toISOString(),
                board: 'CBSE',
                classLevel: '10',
                stream: 'Science'
            }));
        }""")

        print("Reloading to trigger dashboard logic...")
        await page.reload()
        await page.wait_for_timeout(3000)

        print("Capturing dashboard state...")
        await page.screenshot(path='/home/jules/verification/dashboard_free.png')

        await page.evaluate("""() => {
            localStorage.setItem('nst_current_user', JSON.stringify({
                id: 'student123',
                name: 'Test Student',
                role: 'STUDENT',
                subscriptionTier: 'MONTHLY',
                subscriptionLevel: 'BASIC',
                isPremium: true,
                credits: 0,
                lastLoginRewardDate: new Date().toISOString(),
                board: 'CBSE',
                classLevel: '10',
                stream: 'Science'
            }));
        }""")
        await page.reload()
        await page.wait_for_timeout(3000)
        await page.screenshot(path='/home/jules/verification/dashboard_basic.png')

        await browser.close()

    os.system("kill $(lsof -t -i :4175) 2>/dev/null || true")

asyncio.run(main())
