import urllib.request
import re

html = urllib.request.urlopen('https://foresight-frontend-locf.onrender.com/').read().decode('utf-8')
js_match = re.search(r'src="(/assets/[^"]+)"', html)
if js_match:
    js_path = js_match.group(1)
    bundle_url = 'https://foresight-frontend-locf.onrender.com' + js_path
    print(f"Fetching bundle: {bundle_url}")
    js_code = urllib.request.urlopen(bundle_url).read().decode('utf-8')
    
    urls = re.findall(r'(https?://[^\s"\'`)]+|wss?://[^\s"\'`)]+)', js_code)
    print("Found URLs in production bundle:")
    for u in set(urls):
        print(" ->", u)
else:
    print("No JS src match found")
