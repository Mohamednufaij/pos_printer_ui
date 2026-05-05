const output = document.getElementById("output");

const baseUrlInput = document.getElementById("baseUrl");
const apiKeyInput = document.getElementById("apiKey");
const printerInput = document.getElementById("printer");
const storeInput = document.getElementById("store");
const itemNameInput = document.getElementById("itemName");
const qtyInput = document.getElementById("qty");
const priceInput = document.getElementById("price");

document.getElementById("btnStatus").addEventListener("click", () => callApi("/status", { method: "GET" }));
document.getElementById("btnPrinters").addEventListener("click", () => callApi("/printers", { method: "GET" }));
document.getElementById("btnPrint").addEventListener("click", sendPrint);

async function sendPrint() {
  const qty = Number(qtyInput.value || 1);
  const price = Number(priceInput.value || 0);
  const payload = {
    printer: printerInput.value.trim() || null,
    type: "receipt",
    content: {
      store: storeInput.value.trim() || "Vercel Test Store",
      items: [
        {
          name: itemNameInput.value.trim() || "Sample Item",
          qty,
          price
        }
      ],
      total: Number((qty * price).toFixed(2)),
      timestamp: new Date().toISOString()
    }
  };

  await callApi("/print", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

async function callApi(path, options) {
  const baseUrl = baseUrlInput.value.trim().replace(/\/$/, "");
  const apiKey = apiKeyInput.value.trim();
  const headers = {
    "Content-Type": "application/json"
  };

  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }

  const requestOptions = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  };

  setOutput({ loading: true, request: { url: `${baseUrl}${path}`, options: requestOptions } });

  try {
    const response = await fetch(`${baseUrl}${path}`, requestOptions);
    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    setOutput({
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data
    });
  } catch (error) {
    setOutput({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      tip: "If hosted on Vercel, browser can only reach your local bridge on the same machine that opens this page."
    });
  }
}

function setOutput(data) {
  output.textContent = JSON.stringify(data, null, 2);
}
