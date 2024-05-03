# SecLM library
This library provides convenient access to pin an SSL certificate to a specific pubkey.

## Installation
```
pip install seclm
```

## Usage
Here are some examples of using it in different libraries.
```python
# specify url and sha256
from seclm.ssl import create_ssl_context
ssl_context = create_ssl_context("https://example.seclm.com", "9e69296bf68815839e2cf5c324318f304ba8a7de2f587245c0cb75f54e3fe196")

# httpx
import httpx
httpx.get("https://example.seclm.com", verify=ssl_context)

# aiohttp
import asyncio
import aiohttp
async def main():
    async with aiohttp.ClientSession() as session:
        async with session.get("https://example.seclm.com", ssl=ssl_context) as response:
            await response.text()
asyncio.run(main())

# openai
from openai import OpenAI, DefaultHttpxClient
client = OpenAI(
    api_key="EMPTY",
    base_url="https://example.seclm.com/v1",
    http_client=DefaultHttpxClient(verify=ssl_context)
)
chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Say this is a test",
        }
    ],
    model="meta-llama/Meta-Llama-3-8B-Instruct",
)
```