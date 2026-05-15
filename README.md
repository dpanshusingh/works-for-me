# FERMAT — Fashion AI (personal replica)

A static, client-side replica of the [Fermat](https://www.fermat.app/)
fashion-AI experience: an editorial landing page plus a **working Studio**
that turns sketches, garments and moodboards into high-fidelity renders.

> Personal learning project. Not affiliated with Fermat.

## What it does

| Mode | Input | Output |
|------|-------|--------|
| Sketch → render | a sketch + prompt | photoreal product render |
| Apply material | a garment + prompt | same garment, new fabric/print |
| Virtual try-on | a garment + prompt | garment on a model |
| Seamless tile | a moodboard + prompt | tileable textile print |
| Text → design | prompt only | design from description |

## Run it

No build step. Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Configure

1. Click **API key** (top-right).
2. Paste an image-model API key. Default provider is **OpenAI Images**
   (`gpt-image-1`); change the base URL for any OpenAI-compatible endpoint.
3. Save. The key lives only in this browser's `localStorage` and is sent
   straight from your browser to the provider — there is no backend.

⚠️ Because calls are client-side, your key is visible to anything running in
the page. Use a scoped/limited key and don't run this on a shared machine.

## Files

- `index.html` — landing page + Studio markup
- `assets/styles.css` — all styling
- `assets/app.js` — upload, prompt building, API calls, history
