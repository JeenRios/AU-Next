from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_trading_journal(page: Page):
    # Go to landing page
    page.goto("http://localhost:3006")
    time.sleep(2)

    # Inject user into localStorage
    page.evaluate('localStorage.setItem("user", JSON.stringify({email: "user@au.com", role: "user", name: "Test User"}))')

    # Navigate to dashboard (My Trading tab)
    page.goto("http://localhost:3006/dashboard?tab=my-trading")
    time.sleep(5)

    # Take screenshot of the trades table with Journal icons
    page.screenshot(path="verification/journal_table.png", full_page=True)

    # Check if a journal button exists and click it
    journal_buttons = page.locator('button[title*="Reflection"]')
    if journal_buttons.count() > 0:
        journal_buttons.first.click()
        time.sleep(2)
        # Take screenshot of the Journal Modal
        page.screenshot(path="verification/journal_modal.png")
        print("Journal modal verified")
    else:
        print("No trades found to verify journal modal")

    # Navigate back to dashboard to see analytics
    page.goto("http://localhost:3006/dashboard?tab=dashboard")
    time.sleep(5)
    page.screenshot(path="verification/analytics_new.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_trading_journal(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
