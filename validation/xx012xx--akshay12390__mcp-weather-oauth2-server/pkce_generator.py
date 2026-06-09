import secrets
import hashlib
import base64
import urllib.parse

def generate_code_verifier():
    token = secrets.token_bytes(32)
    return base64.urlsafe_b64encode(token).rstrip(b'=').decode('utf-8')

def generate_code_challenge(verifier):
    sha256_hash = hashlib.sha256(verifier.encode('utf-8')).digest()
    return base64.urlsafe_b64encode(sha256_hash).rstrip(b'=').decode('utf-8')

def generate_state():
    """Generate a random state parameter"""
    return secrets.token_urlsafe(32)

def main():
    # Generate PKCE parameters
    code_verifier = generate_code_verifier()
    code_challenge = generate_code_challenge(code_verifier)
    state = generate_state()

    # Print parameters
    print(f"Code Verifier: {code_verifier}")
    print(f"Code Challenge: {code_challenge}")
    print(f"Code Challenge Method: S256")
    print(f"State: {state}")

    # Client configuration
    client_id = 'mcp-client'
    redirect_uri = 'https://mcp-weather-oauth2-server-1e9dd0f77fe5.herokuapp.com/display-code'

    # Create authorization URL with PKCE
    auth_url = (
        'https://mcp-weather-oauth2-server-1e9dd0f77fe5.herokuapp.com/oauth2/authorize'
        f'?response_type=code'
        f'&client_id={client_id}'
        f'&redirect_uri={redirect_uri}'
        f'&scope=weather.read'
        f'&code_challenge={code_challenge}'
        f'&code_challenge_method=S256'
        f'&state={state}'
    )

    print("\nAuthorization URL:")
    print(auth_url)

if __name__ == '__main__':
    main() 