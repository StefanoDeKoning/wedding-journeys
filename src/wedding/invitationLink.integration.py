"""Run with GUEST_INVITATION_URL set to a valid personal invitation URL."""
import os
import unittest
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright


class InvitationLinkTest(unittest.TestCase):
    def test_signed_out_guest_opens_correct_wedding_without_manual_login(self):
        invitation_url = os.environ["GUEST_INVITATION_URL"]
        parts = urlsplit(invitation_url)
        wedding_path = "/" + parts.path.strip("/").split("/")[0]
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 1800})
            page.goto(invitation_url, wait_until="domcontentloaded", timeout=90000)
            page.wait_for_url(
                lambda url: urlsplit(url).path.rstrip("/") == wedding_path,
                timeout=60000,
            )
            page.get_by_role("button", name="Sign out", exact=True).wait_for(timeout=30000)
            self.assertEqual(page.get_by_role("button", name="Open my invitation", exact=True).count(), 0)
            self.assertEqual(urlsplit(page.url).path.rstrip("/"), wedding_path)
            page.reload(wait_until="domcontentloaded")
            page.get_by_role("button", name="Sign out", exact=True).wait_for(timeout=30000)
            self.assertEqual(page.get_by_role("button", name="Open my invitation", exact=True).count(), 0)
            browser.close()


if __name__ == "__main__":
    unittest.main()