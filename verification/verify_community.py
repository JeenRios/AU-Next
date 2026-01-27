from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_community_tab(page: Page):
    # Go to landing page first
    page.goto("http://localhost:3006")
    time.sleep(2)

    # Inject user into localStorage
    page.evaluate('localStorage.setItem("user", JSON.stringify({email: "user@au.com", role: "user", name: "Test User"}))')

    # Try to set cookie if possible (though au_session usually needs to be valid on server)
    # Since we can't easily mock the server's session check in Redis,
    # the dashboard will likely redirect to / if the middleware blocks it.

    # Let's try to navigate to dashboard
    page.goto("http://localhost:3006/dashboard?tab=community")
    time.sleep(5)

    # Take a screenshot regardless of where we landed
    page.screenshot(path="verification/community_verification.png", full_page=True)

    # Check if we are on dashboard
    if "dashboard" in page.url:
        print("Successfully reached dashboard")
    else:
        print(f"Redirected to {page.url}")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_community_tab(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
