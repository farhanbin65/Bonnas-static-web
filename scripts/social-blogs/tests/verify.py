import requests

TOKEN = "EAARnji2U7xQBS4VUKJ1xHCHFf2POtRRynJBODwmaGQ2BQsLwfmOpn2t7dDcmfRFidtDVXXsAqZAmBIljZA8niP3eqnNprcYZC2FW25njvp38OVc8LmhZCwa6IRhEF2kbOeUNG4IVRDCr0X8OBtTvUMeR5jUvyjFw0dige1ePrx7YdJOvhtnJdZBWVRQuNB10f"
PAGE_ID = "517357318138329"

r = requests.get(
    f"https://graph.facebook.com/v19.0/{PAGE_ID}",
    params={"access_token": TOKEN, "fields": "id,name"}
)
print(r.status_code, r.json())