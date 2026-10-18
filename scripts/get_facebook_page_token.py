import requests
import os
from dotenv import load_dotenv

load_dotenv()

def get_page_access_token():
    """
    Get Page Access Token using your Facebook credentials.
    """
    print("=" * 60)
    print("📱 Facebook Page Access Token Generator")
    print("=" * 60)
    
    # Get User Access Token from Graph API Explorer
    user_token = input("\n1️⃣  Paste your User Access Token (from Graph API Explorer):\n> ").strip()
    page_id = input("\n2️⃣  Enter your Page ID (find at facebook.com/[page]/about):\n> ").strip()
    
    if not user_token or not page_id:
        print("❌ Missing token or page ID")
        return
    
    print("\n⏳ Fetching page access token...")
    
    try:
        response = requests.get(
            "https://graph.facebook.com/me/accounts",
            params={
                "access_token": user_token,
                "fields": "id,name,access_token"
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        # Find the matching page
        for account in data.get("data", []):
            if account["id"] == page_id:
                page_name = account["name"]
                page_token = account["access_token"]
                
                print("\n" + "=" * 60)
                print(f"✅ Found: {page_name}")
                print("=" * 60)
                print(f"\n📋 Page Access Token:\n{page_token}\n")
                print("=" * 60)
                print("\n📌 Add these to GitHub Secrets:")
                print(f"   FACEBOOK_PAGE_ID = {page_id}")
                print(f"   FACEBOOK_ACCESS_TOKEN = {page_token}")
                print(f"   INSTAGRAM_ACCESS_TOKEN = {page_token}")
                print("=" * 60)
                
                return page_token
        
        print(f"❌ Page {page_id} not found")
        print(f"\n📍 Available pages:")
        for account in data.get("data", []):
            print(f"   - {account['name']} (ID: {account['id']})")
    
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    get_page_access_token()