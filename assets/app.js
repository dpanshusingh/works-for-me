"use strict";

const $ = (id) => document.getElementById(id);

/* ---------- providers ---------- */
const PROVIDERS = {
  gemini: {
    label: "Google Gemini",
    defaultModel: "gemini-2.5-flash-image",
    defaultBase: "https://generativelanguage.googleapis.com/v1beta",
    async run({ base, model, key, prompt, file, signal }) {
      const m = model.replace(/^models\//, "");
      const parts = [{ text: prompt }];
      if (file) {
        const inl = await fileToInline(file);
        parts.push({ inline_data: { mime_type: inl.mime, data: inl.data } });
      }
      const res = await fetch(
        `${base}/models/${encodeURIComponent(m)}:generateContent`,
        {
          method: "POST",
          signal,
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data?.error?.message || `Gemini error ${res.status}`);
      if (data?.promptFeedback?.blockReason)
        throw new Error(
          `Blocked by safety filter (${data.promptFeedback.blockReason}). Try rephrasing.`
        );
      const cand = data?.candidates?.[0];
      const cparts = cand?.content?.parts || [];
      const imgPart = cparts.find((p) => p.inlineData || p.inline_data);
      if (!imgPart) {
        const txt = cparts.map((p) => p.text).filter(Boolean).join(" ").trim();
        const fr = cand?.finishReason;
        if (fr && fr !== "STOP")
          throw new Error(`No image returned (${fr}).${txt ? " " + txt : ""}`);
        throw new Error(txt ? `Model returned text only: ${txt}` : "No image returned.");
      }
      const inl = imgPart.inlineData || imgPart.inline_data;
      return `data:${inl.mimeType || inl.mime_type || "image/png"};base64,${inl.data}`;
    },
  },

  openai: {
    label: "OpenAI",
    defaultModel: "gpt-image-1",
    defaultBase: "https://api.openai.com/v1",
    async run({ base, model, key, prompt, file, size, quality, signal }) {
      const headers = { Authorization: `Bearer ${key}` };
      let res;
      if (file) {
        const fd = new FormData();
        fd.append("model", model);
        fd.append("image", file);
        fd.append("prompt", prompt);
        fd.append("size", size);
        fd.append("quality", quality);
        res = await fetch(`${base}/images/edits`, {
          method: "POST",
          headers,
          body: fd,
          signal,
        });
      } else {
        res = await fetch(`${base}/images/generations`, {
          method: "POST",
          signal,
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ model, prompt, size, quality }),
        });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data?.error?.message || `OpenAI error ${res.status}`);
      const b64 = data?.data?.[0]?.b64_json;
      if (!b64) throw new Error("No image returned.");
      return `data:image/png;base64,${b64}`;
    },
  },
};

/* ---------- modes ---------- */
const MODES = {
  sketch: {
    needsImage: true,
    tpl: (p) =>
      `Transform this fashion sketch into a photorealistic, high-fidelity product render. Stay faithful to the silhouette, proportions and design lines of the sketch. ${p}. Clean neutral studio background, soft editorial lighting, ultra-detailed fabric and stitching.`,
  },
  material: {
    needsImage: true,
    tpl: (p) =>
      `Apply the described material, colour, texture or print to this garment while preserving its exact shape, cut and construction. ${p}. Realistic fabric drape and sheen, high-resolution professional product photography.`,
  },
  tryon: {
    needsImage: true,
    tpl: (p) =>
      `Place this garment on a fashion model for a professional photoshoot. ${p}. Full-body editorial shot, natural pose, flattering lighting, high-fashion magazine quality, realistic fit.`,
  },
  tile: {
    needsImage: true,
    tpl: (p) =>
      `Create a seamless, perfectly tileable textile print derived from this artwork or moodboard. ${p}. Balanced repeating pattern with no visible seams, high resolution, suitable for fabric printing.`,
  },
  text: {
    needsImage: false,
    tpl: (p) =>
      `${p}. Original fashion design concept, editorial product render, clean studio background, soft directional lighting, ultra-detailed materials.`,
  },
};

const ASPECT_HINT = {
  square: "Square 1:1 framing.",
  portrait: "Vertical full-length portrait, 2:3 framing.",
  landscape: "Horizontal 3:2 framing.",
};
const OPENAI_SIZE = {
  square: "1024x1024",
  portrait: "1024x1536",
  landscape: "1536x1024",
};

const CHIPS = [
  "matte black technical wool",
  "washed indigo denim",
  "liquid silver lamé",
  "ivory silk charmeuse",
  "quilted ripstop nylon",
  "cropped boxy fit",
  "floor-length drape",
  "tonal cable knit",
];

const state = {
  mode: "sketch",
  file: null,
  inputURL: null,
  busy: false,
  controller: null,
  compareReady: false,
};

/* ---------- settings storage (per provider) ---------- */
const lsGet = (k) => localStorage.getItem(k) || "";
function currentProvider() {
  return lsGet("fermat_provider") || "gemini";
}
function cfg(provider = currentProvider()) {
  const def = PROVIDERS[provider] || PROVIDERS.gemini;
  return {
    provider,
    key: lsGet(`fermat_${provider}_key`),
    model: lsGet(`fermat_${provider}_model`) || def.defaultModel,
    base: (lsGet(`fermat_${provider}_base`) || def.defaultBase).replace(/\/+$/, ""),
  };
}

function fillProviderFields() {
  const p = $("provider").value;
  const def = PROVIDERS[p];
  $("api-key").value = lsGet(`fermat_${p}_key`);
  $("api-model").value = lsGet(`fermat_${p}_model`) || def.defaultModel;
  $("api-base").value = lsGet(`fermat_${p}_base`) || def.defaultBase;
  $("modal-sub").innerHTML = `Connecting to <strong>${def.label}</strong> · default model <code>${def.defaultModel}</code>. Keys are stored only in this browser and sent straight to the provider — don’t use this on a shared machine.`;
}
function openSettings() {
  $("provider").value = currentProvider();
  fillProviderFields();
  $("settings").hidden = false;
  $("api-key").focus();
}
function closeSettings() {
  $("settings").hidden = true;
}

$("open-settings").addEventListener("click", openSettings);
$("close-settings").addEventListener("click", closeSettings);
$("provider").addEventListener("change", fillProviderFields);
$("settings").addEventListener("click", (e) => {
  if (e.target === $("settings")) closeSettings();
});
$("save-key").addEventListener("click", () => {
  const p = $("provider").value;
  const def = PROVIDERS[p];
  localStorage.setItem("fermat_provider", p);
  const k = $("api-key").value.trim();
  if (k) localStorage.setItem(`fermat_${p}_key`, k);
  localStorage.setItem(`fermat_${p}_model`, $("api-model").value.trim() || def.defaultModel);
  localStorage.setItem(`fermat_${p}_base`, $("api-base").value.trim() || def.defaultBase);
  closeSettings();
  refreshReady("Saved. ");
});
$("clear-key").addEventListener("click", () => {
  const p = $("provider").value;
  ["key", "model", "base"].forEach((s) =>
    localStorage.removeItem(`fermat_${p}_${s}`)
  );
  fillProviderFields();
  refreshReady("Cleared. ");
});

/* ---------- modes / chips ---------- */
document.querySelectorAll(".mode").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.mode = btn.dataset.mode;
    $("drop-hint").style.display = MODES[state.mode].needsImage ? "none" : "block";
  });
});

const chipWrap = $("chips");
CHIPS.forEach((c) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip";
  b.textContent = c;
  b.addEventListener("click", () => {
    const ta = $("prompt");
    ta.value = ta.value.trim() ? `${ta.value.trim()}, ${c}` : c;
    ta.focus();
  });
  chipWrap.appendChild(b);
});

/* ---------- image input ---------- */
const drop = $("drop");
const fileInput = $("file");

function setImage(file) {
  if (!file || !file.type.startsWith("image/")) return;
  if (state.inputURL) URL.revokeObjectURL(state.inputURL);
  state.file = file;
  state.inputURL = URL.createObjectURL(file);
  const prev = $("preview");
  prev.src = state.inputURL;
  prev.hidden = false;
  $("drop-empty").style.display = "none";
  $("clear-img").hidden = false;
}
function clearImage() {
  if (state.inputURL) URL.revokeObjectURL(state.inputURL);
  state.file = null;
  state.inputURL = null;
  fileInput.value = "";
  $("preview").hidden = true;
  $("preview").src = "";
  $("drop-empty").style.display = "flex";
  $("clear-img").hidden = true;
}

fileInput.addEventListener("change", (e) => setImage(e.target.files[0]));
$("clear-img").addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  clearImage();
});
["dragover", "dragenter"].forEach((ev) =>
  drop.addEventListener(ev, (e) => {
    e.preventDefault();
    drop.classList.add("over");
  })
);
["dragleave", "drop"].forEach((ev) =>
  drop.addEventListener(ev, (e) => {
    e.preventDefault();
    drop.classList.remove("over");
  })
);
drop.addEventListener("drop", (e) => {
  const f = e.dataTransfer.files && e.dataTransfer.files[0];
  if (f) setImage(f);
});
window.addEventListener("paste", (e) => {
  if ($("settings").hidden === false) return;
  const item = [...(e.clipboardData?.items || [])].find((i) =>
    i.type.startsWith("image/")
  );
  if (item) setImage(item.getAsFile());
});

/* ---------- helpers ---------- */
function fileToInline(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result);
      res({ mime: file.type || "image/png", data: s.slice(s.indexOf(",") + 1) });
    };
    r.onerror = () => rej(new Error("Could not read the image file."));
    r.readAsDataURL(file);
  });
}
function makeThumb(dataUrl) {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const max = 150;
      const s = Math.min(max / img.width, max / img.height, 1);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      try {
        res(c.toDataURL("image/jpeg", 0.7));
      } catch {
        res(dataUrl);
      }
    };
    img.onerror = () => res(dataUrl);
    img.src = dataUrl;
  });
}

/* ---------- IndexedDB history ---------- */
const DB_NAME = "fermat";
const STORE = "renders";
function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: "id" });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function histAll() {
  try {
    const db = await idb();
    return await new Promise((res) => {
      const q = db.transaction(STORE).objectStore(STORE).getAll();
      q.onsuccess = () => res((q.result || []).sort((a, b) => b.ts - a.ts));
      q.onerror = () => res([]);
    });
  } catch {
    return [];
  }
}
async function histPut(rec) {
  try {
    const db = await idb();
    db.transaction(STORE, "readwrite").objectStore(STORE).put(rec);
    const all = await histAll();
    if (all.length > 30) {
      const db2 = await idb();
      const os = db2.transaction(STORE, "readwrite").objectStore(STORE);
      all.slice(30).forEach((r) => os.delete(r.id));
    }
  } catch {
    /* history is best-effort */
  }
}
async function histClear() {
  try {
    const db = await idb();
    db.transaction(STORE, "readwrite").objectStore(STORE).clear();
  } catch {
    /* ignore */
  }
}
async function renderHistory() {
  const all = await histAll();
  const wrap = $("history");
  wrap.innerHTML = "";
  all.forEach((rec) => {
    const img = document.createElement("img");
    img.src = rec.thumb;
    img.alt = rec.prompt || "Previous render";
    img.title = `${rec.mode} · ${new Date(rec.ts).toLocaleString()}`;
    img.addEventListener("click", () => showResult(rec.full, false));
    wrap.appendChild(img);
  });
  $("clear-history").style.visibility = all.length ? "visible" : "hidden";
}
$("clear-history").addEventListener("click", async () => {
  await histClear();
  renderHistory();
});

/* ---------- output ---------- */
function setStatus(msg, kind) {
  const el = $("status");
  el.textContent = msg;
  el.className = "status" + (kind ? " " + kind : "");
}
function refreshReady(prefix = "") {
  const c = cfg();
  if (!c.key) {
    setStatus(`${prefix}Add a ${PROVIDERS[c.provider].label} API key to start.`, "");
  } else {
    setStatus(`${prefix}Ready · ${PROVIDERS[c.provider].label} (${c.model}).`, "ok");
  }
}
function setBusy(on) {
  state.busy = on;
  const btn = $("generate");
  btn.querySelector(".gen-label").textContent = on ? "Cancel" : "Generate";
  btn.querySelector(".spinner").hidden = !on;
  btn.classList.toggle("busy", on);
}
function showResult(src, withCompare) {
  const r = $("result");
  r.src = src;
  r.hidden = false;
  $("canvas-empty").style.display = "none";
  $("result-actions").hidden = false;
  $("download").href = src;
  $("download").download = `fermat-${state.mode}-${Date.now()}.png`;

  const ci = $("compare-img");
  if (withCompare && state.inputURL) {
    ci.src = state.inputURL;
    ci.hidden = false;
    $("compare-wrap").hidden = false;
    state.compareReady = true;
    applyCompare();
  } else {
    ci.hidden = true;
    $("compare-wrap").hidden = true;
    state.compareReady = false;
  }
}
function applyCompare() {
  const v = $("compare").value;
  $("compare-img").style.clipPath = `inset(0 ${v}% 0 0)`;
}
$("compare").addEventListener("input", applyCompare);

/* ---------- generate ---------- */
async function generate() {
  if (state.busy) {
    state.controller?.abort();
    return;
  }
  const c = cfg();
  if (!c.key) {
    setStatus(`Add a ${PROVIDERS[c.provider].label} API key first.`, "err");
    openSettings();
    return;
  }
  const userText = $("prompt").value.trim();
  const m = MODES[state.mode];
  if (m.needsImage && !state.file) {
    setStatus("This mode needs a source image.", "err");
    return;
  }
  if (!userText && !state.file) {
    setStatus("Describe the look or add an image.", "err");
    return;
  }

  const aspect = $("aspect").value;
  const prompt = `${m.tpl(userText || "high-fashion design")} ${ASPECT_HINT[aspect]}`;
  const n = parseInt($("count").value, 10) || 1;
  const provider = PROVIDERS[c.provider];

  state.controller = new AbortController();
  setBusy(true);
  let made = 0;
  let lastErr = null;

  for (let i = 1; i <= n; i++) {
    setStatus(
      n > 1 ? `Rendering ${i} of ${n}…` : "Rendering… this can take 10–40s.",
      ""
    );
    try {
      const src = await provider.run({
        base: c.base,
        model: c.model,
        key: c.key,
        prompt,
        file: state.file,
        size: OPENAI_SIZE[aspect],
        quality: $("quality").value,
        signal: state.controller.signal,
      });
      showResult(src, !!state.file);
      const thumb = await makeThumb(src);
      await histPut({
        id:
          (crypto.randomUUID && crypto.randomUUID()) ||
          String(Date.now() + Math.random()),
        ts: Date.now(),
        mode: state.mode,
        prompt: userText,
        full: src,
        thumb,
      });
      made++;
    } catch (err) {
      if (err.name === "AbortError") {
        setStatus(`Cancelled${made ? ` after ${made} render(s).` : "."}`, "");
        setBusy(false);
        renderHistory();
        return;
      }
      lastErr = err;
    }
  }

  setBusy(false);
  renderHistory();
  if (made && lastErr)
    setStatus(`Made ${made}/${n}. Last error: ${lastErr.message}`, "err");
  else if (made) setStatus(`Done — ${made} render${made > 1 ? "s" : ""}.`, "ok");
  else setStatus(lastErr ? lastErr.message : "Generation failed.", "err");
}

$("generate").addEventListener("click", generate);

$("reuse").addEventListener("click", async () => {
  const src = $("result").src;
  if (!src) return;
  const blob = await (await fetch(src)).blob();
  setImage(new File([blob], "previous.png", { type: blob.type || "image/png" }));
  $("studio").scrollIntoView({ behavior: "smooth" });
});

/* ---------- keyboard ---------- */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!$("settings").hidden) closeSettings();
    else if (state.busy) state.controller?.abort();
  }
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    generate();
  }
});

/* ---------- reveal ---------- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ---------- init ---------- */
$("drop-hint").style.display = MODES[state.mode].needsImage ? "none" : "block";
renderHistory();
refreshReady();
