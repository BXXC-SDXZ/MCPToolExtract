import requests
import os

# Server URL (default to localhost if not set)
#server_url = 'http://localhost:8080'
server_url = 'https://mcp-weather-oauth2-server-1e9dd0f77fe5.herokuapp.com'


# Client ID and Secret
client_id = 'mcp-client'
client_secret = 'secret'

# Authorization code received from authorization server
authorization_code = 'KDbI21ctyW_CeJcrBhOgK5gYuwKyu9IxYv4BCIAaxf_PTOQcqmmBvMUZBMmgoVsr6Xjm0eMFI3RxzmINzBalRfd3p5McjKabTBZ__tCXl6G6MUyKizEcXdOnrB-uqDDG'
# Code verifier that matches the code_challenge used in authorization request
code_verifier = '96Q2TFzL4xEcFl5HA_dyaoSmsv4rmDl18XFnWjAPsFM'

# Token endpoint
token_url = f'{server_url}/oauth2/token'

# Headers
headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
}

# Request body
data = {
    'grant_type': 'authorization_code',
    'code': authorization_code,
    'redirect_uri': f'http://localhost:8080/display-code',
    'code_verifier': code_verifier,
    'client_id': client_id,
    'client_secret': client_secret  # Added client_secret for CLIENT_SECRET_POST authentication
}

# Make the token request
response = requests.post(token_url, headers=headers, data=data)

# Print the response
print(f"Status Code: {response.status_code}")
print("Response:")
print(response.text) 