#!/usr/bin/env python3
# ------------------
# Create a campaign
# ------------------
# Include the Brevo library
from __future__ import print_function
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from pprint import pprint

# Instantiate the client
configuration = sib_api_v3_sdk.Configuration()
configuration.api_key['api-key'] = 'xsmtpsib-fd8d2aea925067bca7273c6f7bc5c23ccfa37fc120d5639f7052b5c51ce7c025-CgNaFAL2PsXDaegS'
api_instance = sib_api_v3_sdk.EmailCampaignsApi(sib_api_v3_sdk.ApiClient(configuration))

# Define the campaign settings
email_campaigns = sib_api_v3_sdk.CreateEmailCampaign(
    name="Campaign sent via the API",
    subject="My subject",
    sender={"name": "From name", "email": "batsindakeynesbenoit10101@gmail.com"},
    html_content="Congratulations! You successfully sent this example campaign via the Brevo API.",
)

# Make the call to the client
try:
    api_response = api_instance.create_email_campaign(email_campaigns)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling EmailCampaignsApi->create_email_campaign: %s\n" % e)
