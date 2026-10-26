import requests

APP_ID = "1239760254594836"
APP_SECRET = "c891320e7c3c71e8439b3442cf3ae99a"
SHORT_LIVED_TOKEN = "EAARnji2U7xQBSwIMUCNFwKo7hVy0ZA9Fjt2sfYpGzoFuFAjDdGGAldkzRPQkRRdyWCPy5spia2QEBDIZCiyPJ34CxEoZBaSzKa5JJGBNICgb8tqVld7mHuxXhLfNL9ZBQBCZAhZBix79QxkSNmdZAXscfgyuxTND8IaO3OvJZBfw6XZAjDfQRBa1unt1ZCNB8OTP3WWzHFBMlpgNcB6po3d1vcwtlYeWVwvwgEMfgeiP257R8OhInarKSmH9N6dhOl0HJCPM4vRHnfRKZCg0BJOZBHIHpwZDZD"

r = requests.get("https://graph.facebook.com/v25.0/oauth/access_token", params={
    "grant_type": "fb_exchange_token",
    "client_id": APP_ID,
    "client_secret": APP_SECRET,
    "fb_exchange_token": SHORT_LIVED_TOKEN
})
print(r.json())