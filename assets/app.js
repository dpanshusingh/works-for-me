"use strict";

const KEY_STORE = "fermat_api_key";
const BASE_STORE = "fermat_api_base";
const DEFAULT_BASE = "https://api.openai.com/v1";

const $ = (id) => document.getElementById(id);

const state = {
  mode: "sketch",
  file: null,
  history: [],
};

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

/* ---------- settings ---------- */
function getKey() {
  return localStorage.getItem(KEY_STORE) || "";
}
function getBase() {
  return (localStorage.getItem(BASE_STORE) || DEFAULT_BASE).replace(/\/+$/, "");
}

function openSettings() {
  $("api-key").value = getKey();
  $("api-base").value = getBase();
  $("settings").hidden = false;
}
function closeSettings() {
  $("settings").hidden = true;
}

$("open-settings").addEventListener("click", openSettings);
$("close-settings").addEventListener("click", closeSettings);
$("settings").addEventListener("click", (e) => {
  if (e.target === $("settings")) closeSettings();
});
$("save-key").addEventListener("click", () => {
  const k = $("api-key").value.trim();
  const b = $("api-base").value.trim() || DEFAULT_BASE;
  if (k) localStorage.setItem(KEY_STORE, k);
  localStorage.setItem(BASE_STORE, b);
  closeSettings();
  setStatus("API key saved in this browser.", "ok");
});
$("clear-key").addEventListener("click", () => {
  localStorage.removeItem(KEY_STORE);
  localStorage.removeItem(BASE_STORE);
  $("api-key").value = "";
  $("api-base").value = "";
  setStatus("API key cleared.", "");
});

/* ---------- modes ---------- */
document.querySelectorAll(".mode").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.mode = btn.dataset.mode;
    const optional = !MODES[state.mode].needsImage;
    $("drop-hint").style.display = optional ? "block" : "none";
  });
});

/* ---------- image input ---------- */
const drop = $("drop");
const fileInput = $("file");

function setImage(file) {
  if (!file || !file.type.startsWith("image/")) return;
  state.file = file;
  const url = URL.createObjectURL(file);
  const prev = $("preview");
  prev.src = url;
  prev.hidden = false;
  $("drop-empty").style.display = "none";
  $("clear-img").hidden = false;
}
function clearImage() {
  state.file = null;
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
  const item = [...(e.clipboardData?.items || [])].find((i) =>
    i.type.startsWith("image/")
  );
  if (item) setImage(item.getAsFile());
});

/* ---------- generation ---------- */
function setStatus(msg, kind) {
  const el = $("status");
  el.textContent = msg;
  el.className = "status" + (kind ? " " + kind : "");
}
function setLoading(on) {
  const btn = $("generate");
  btn.disabled = on;
  btn.querySelector(".gen-label").textContent = on ? "Generating…" : "Generate";
  btn.querySelector(".spinner").hidden = !on;
}

async function callImageApi({ key, base, prompt, size, quality, file }) {
  const headers = { Authorization: `Bearer ${key}` };
  let res;

  if (file) {
    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("image", file);
    form.append("prompt", prompt);
    form.append("size", size);
    form.append("quality", quality);
    res = await fetch(`${base}/images/edits`, { method: "POST", headers, body: form });
  } else {
    res = await fetch(`${base}/images/generations`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-image-1", prompt, size, quality }),
    });
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `Request failed (${res.status})`);
  }
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image returned by the provider.");
  return `data:image/png;base64,${b64}`;
}

function pushHistory(src) {
  state.history.unshift(src);
  state.history = state.history.slice(0, 8);
  const wrap = $("history");
  wrap.innerHTML = "";
  state.history.forEach((s) => {
    const img = document.createElement("img");
    img.src = s;
    img.alt = "Previous render";
    img.addEventListener("click", () => showResult(s));
    wrap.appendChild(img);
  });
}

function showResult(src) {
  const r = $("result");
  r.src = src;
  r.hidden = false;
  $("canvas-empty").style.display = "none";
  $("result-actions").hidden = false;
  $("download").href = src;
}

async function generate() {
  const key = getKey();
  if (!key) {
    setStatus("Add your API key first (top-right “API key”).", "err");
    openSettings();
    return;
  }
  const prompt = $("prompt").value.trim();
  const cfg = MODES[state.mode];
  if (cfg.needsImage && !state.file) {
    setStatus("This mode needs a source image.", "err");
    return;
  }
  if (!prompt && !state.file) {
    setStatus("Describe the look or add an image.", "err");
    return;
  }

  setLoading(true);
  setStatus("Talking to the image model… this can take 10–40s.", "");

  try {
    const src = await callImageApi({
      key,
      base: getBase(),
      prompt: cfg.tpl(prompt || "high-fashion design"),
      size: $("size").value,
      quality: $("quality").value,
      file: cfg.needsImage || state.file ? state.file : null,
    });
    showResult(src);
    pushHistory(src);
    setStatus("Done. Download it or feed it back in to iterate.", "ok");
  } catch (err) {
    setStatus(err.message || "Generation failed.", "err");
  } finally {
    setLoading(false);
  }
}

$("generate").addEventListener("click", generate);

$("reuse").addEventListener("click", async () => {
  const src = $("result").src;
  if (!src) return;
  const blob = await (await fetch(src)).blob();
  setImage(new File([blob], "previous.png", { type: "image/png" }));
  document.getElementById("studio").scrollIntoView({ behavior: "smooth" });
});

/* ---------- scroll reveal ---------- */
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

/* ---------- first-run hint ---------- */
if (!getKey()) {
  setStatus("Tip: add an image-model API key to start generating.", "");
}
