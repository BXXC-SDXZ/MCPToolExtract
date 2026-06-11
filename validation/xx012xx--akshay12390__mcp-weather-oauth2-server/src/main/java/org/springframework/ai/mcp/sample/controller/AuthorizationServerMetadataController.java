package org.springframework.ai.mcp.sample.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
public class AuthorizationServerMetadataController {

    private final String serverUrl;

    @Autowired
    public AuthorizationServerMetadataController(String serverUrl) {
        this.serverUrl = serverUrl;
    }

    @GetMapping("/.well-known/oauth-authorization-server")
    public Map<String, Object> getMetadata() {
        Map<String, Object> metadata = new HashMap<>();
        
        // Required fields
        metadata.put("issuer", serverUrl);
        metadata.put("authorization_endpoint", serverUrl + "/oauth2/authorize");
        metadata.put("token_endpoint", serverUrl + "/oauth2/token");
        metadata.put("registration_endpoint", serverUrl + "/oauth2/register");
        metadata.put("device_authorization_endpoint", serverUrl + "/oauth2/device_authorization");
        metadata.put("jwks_uri", serverUrl + "/oauth2/jwks");
        
        // Token endpoint authentication methods
        metadata.put("token_endpoint_auth_methods_supported", new String[]{"client_secret_basic", "client_secret_post"});
        
        // Response types and grant types
        metadata.put("response_types_supported", new String[]{"code"});
        metadata.put("grant_types_supported", 
            new String[]{"authorization_code", "client_credentials", "refresh_token"});
        
        // PKCE
        metadata.put("code_challenge_methods_supported", new String[]{"S256"});
        
        // Additional endpoints
        metadata.put("revocation_endpoint", serverUrl + "/oauth2/revoke");
        metadata.put("introspection_endpoint", serverUrl + "/oauth2/introspect");
        
        // Revocation and introspection endpoint auth methods
        metadata.put("revocation_endpoint_auth_methods_supported",
            new String[]{"client_secret_basic", "client_secret_post"});
        metadata.put("introspection_endpoint_auth_methods_supported",
            new String[]{"client_secret_basic", "client_secret_post"});
                        
        // TLS client certificate binding
        metadata.put("tls_client_certificate_bound_access_tokens", true);
        
        return metadata;
    }
} 