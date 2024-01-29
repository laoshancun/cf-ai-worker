# cloudflare AI worker

## Settings API_KEYS
- CloudFlare Dashboard
```plain
[Worker] -> [Settings] -> [Variables]
API_KEYS=APIKEY1,APIKEY2
```
- wrangler.toml

```plain
[vars]
API_KEYS = ""
```

## Example
```
###
POST https://llama2.gitry.com/v1/chat/completion
Content-Type: application/json
Authorization: API_KEY

{
    "messages":[
        {"role":"user","content":"hello"}
    ]
}

###
POST https://llama2.gitry.com/v1/completion
Authorization: API_KEY
Content-Type: application/json

{
    "prompt":"hello"
}

###
POST https://llama2.gitry.com/v1/images/generations
Content-Type: application/json
Authorization: API_KEY

{
    "prompt":"(masterpiece, best quality),1girl with long white hair sitting in a field of green plants and flowers, her hand under her chin, warm lighting, white dress, blurry foreground"
}

```

