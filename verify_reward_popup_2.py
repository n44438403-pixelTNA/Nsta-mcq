import asyncio
from playwright.async_api import async_playwright
import os
import json
from datetime import datetime

async def main():
    os.system("npm run build")
    os.system("npx vite preview --port 4174 > vite_output.log 2>&1 &")
    await asyncio.sleep(5)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 375, 'height': 812})
        page = await context.new_page()

        print("Setting mocked data...")
        await page.goto('http://localhost:4174/')
        await page.evaluate("""() => {
            localStorage.setItem('nst_skip_loading', 'true');
            localStorage.setItem('nst_current_user', JSON.stringify({
                id: 'student123',
                name: 'Test Student',
                role: 'STUDENT',
                subscriptionTier: 'ULTRA',
                subscriptionLevel: 'ULTRA',
                credits: 0,
                lastLoginRewardDate: '2000-01-01T00:00:00.000Z'
            }));
            localStorage.setItem('nst_system_settings', JSON.stringify({
                appName: 'Test App',
                loginBonusConfig: {
                    freeBonus: 2,
                    basicBonus: 100,
                    ultraBonus: 200,
                    strictStreak: false
                }
            }));
        }""")

        print("Reloading to trigger reward logic...")
        await page.reload()
        await page.wait_for_timeout(3000)

        print("Capturing reward popup state...")
        await page.screenshot(path='/home/jules/verification/reward_popup_2.png')
        await browser.close()

    os.system("kill $(lsof -t -i :4174) 2>/dev/null || true")

asyncio.run(main())
