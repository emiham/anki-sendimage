const ENDPOINT = "http://127.0.0.1:8765/api/v1";
const API_KEY = null;
let nextId = 1;

const FILENAME = "send-image.jpg";
const POLL_INTERVAL_MS = 200;
const POLL_TIMEOUT_MS = 10_000;

async function call(method, params = {}) {
  const id = nextId++;
  const headers = { "Content-Type": "application/json" };
  if (API_KEY !== null) headers.Authorization = `Bearer ${API_KEY}`;

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const reply = await response.json();
  if (reply.id !== id) throw new Error("Unexpected response ID");
  if (reply.error) {
    throw Object.assign(new Error(reply.error.message), { rpc: reply.error });
  }
  return reply.result;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForOperation(operationId) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (true) {
    const op = await call("operations.get", { operationId });

    if (op.state === "succeeded") return op.result;
    if (op.state === "failed" || op.state === "cancelled") {
      throw Object.assign(
        new Error(op.error?.message ?? `Operation ${op.state}`),
        { rpc: op.error },
      );
    }

    if (Date.now() >= deadline) {
      throw new Error(
        `Timed out waiting for operation ${operationId} (last state: ${op.state})`,
      );
    }
    await sleep(POLL_INTERVAL_MS);
  }
}

async function fetchAsBase64(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Image download failed: HTTP ${response.status}`);
  }
  const blob = await response.blob();
  if (blob.size === 0) throw new Error("Downloaded image is empty");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(blob);
  });
}

async function sendToAnki(imageUrl) {
  const reviewer = await call("reviewer.get");
  if (!reviewer.card) throw new Error("No card is currently being reviewed");

  const data = await fetchAsBase64(imageUrl);

  const { operationId } = await call("media.store", {
    filename: FILENAME,
    source: { data },
    collision: "rename",
  });
  const stored = await waitForOperation(operationId);
  if (!stored.filename) {
    throw new Error(`Image was not stored (${stored.status})`);
  }

  await call("notes.update", {
    id: reviewer.card.noteId,
    patch: { fields: { Image: `<img src="${stored.filename}">` } },
  });
}
