import requests

APP_ID = "1239760254594836"
APP_SECRET = "c891320e7c3c71e8439b3442cf3ae99a"
SHORT_LIVED_USER_TOKEN = "EAARnji2U7xQBS3cnkkcRYG0O2C4kqEyWxZANQirKah58ja0NRKuZCa9cpWxezjOv79FlSnzeR8jR56RzqZCTN6CmRPfnqWAOVqlZC9KPL0ASpqYHvI2xf2MYVR3LJfqlZAht6ZCPAisusDIsriG1cu7ZA2GW0q7liWiSMV1B075ZAPJgBB8oCk3PZA7XMXQpAs4oe9epj6YZAEWbGGv1UtA8EtCo2aClGKT4vZCZCk8ZD"

# Step 1: exchange short-lived user token for long-lived user token
r = requests.get("https://graph.facebook.com/v19.0/oauth/access_token", params={
    "grant_type": "fb_exchange_token",
    "client_id": APP_ID,
    "client_secret": APP_SECRET,
    "fb_exchange_token": SHORT_LIVED_USER_TOKEN
})
long_lived_user_token = r.json()["access_token"]
print("Long-lived user token:", long_lived_user_token)

# Step 2: get the Page token (inherits long-lived, effectively permanent as long as you don't change your FB password / revoke app)
r = requests.get("https://graph.facebook.com/v19.0/me/accounts", params={
    "access_token": long_lived_user_token
})
for page in r.json()["data"]:
    print(page["name"], page["id"], page["access_token"])