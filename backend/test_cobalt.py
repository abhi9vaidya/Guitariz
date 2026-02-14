import urllib.request
import urllib.parse
import json
import ssl

def test_cobalt():
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
    api_instances = [
        "https://api.cobalt.tools", # Official (v10 maybe)
        "https://cobalt.git.gay",
        "https://cobalt.maybreak.com",
        "https://cobalt.tools", # Sometimes frontend serves API too
        "https://api.cobalt.kwiatekmiki.pl"
    ]
    
    # Payload candidates
    payloads = [
        # v10 Candidate 1 (from some docs)
        {"url": url, "downloadMode": "audio", "audioFormat": "mp3"},
        # v10 Candidate 2
        {"url": url, "mode": "audio", "format": "mp3"},
        # v7 (Legacy)
        {"url": url, "isAudioOnly": True, "aFormat": "mp3"},
    ]

    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }

    # Create SSL context that ignores self-signed certs (just for testing)
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print("Testing Cobalt API Payloads...")
    
    for api_base in api_instances:
        print(f"\n--- Testing Instance: {api_base} ---")
        
        # Endpoints to try
        endpoints = ["/", "/api/json"]
        
        for ep in endpoints:
            full_url = f"{api_base}{ep}"
            for i, payload in enumerate(payloads):
                try:
                    data = json.dumps(payload).encode('utf-8')
                    req = urllib.request.Request(full_url, data=data, headers=headers, method='POST')
                    
                    with urllib.request.urlopen(req, context=ctx, timeout=5) as response:
                        if response.status == 200:
                            body = response.read().decode('utf-8')
                            try:
                                json_body = json.loads(body)
                                if 'url' in json_body or 'stream' in json_body:
                                    print(f"  ✅ SUCCESS! Endpoint: {ep}")
                                    print(f"  ✅ Payload: {json.dumps(payload)}")
                                    print(f"  ✅ Response: {body[:100]}...")
                                    return
                                else:
                                    pass # print(f"  ⚠️ 200 OK but weird body: {body[:50]}")
                            except Exception:
                                pass # print(f"  ⚠️ 200 OK but not JSON")
                        else:
                            pass # print(f"  Status {response.status}")
                except Exception:
                    pass # print(f"  Error {full_url}: {e}")

    print("\nNo working configuration found (User network might be restricted or APIs down).")

if __name__ == "__main__":
    test_cobalt()
