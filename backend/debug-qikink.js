import axios from "axios";

// PASTE YOUR KEYS HERE
const CLIENT_ID = "410121978684652"; 
const CLIENT_SECRET = "1239447bdfb306467b0c33d349ff2243f77bf8c6f0f40203a8bc87540a39b592";

async function debug() {
  const url = "https://api.qikink.com/api/order/create"; // Try Live URL first
  const payload = {
    order_number: "TEST-" + Date.now(),
    qikink_shipping: 1,
    gateway: "COD",
    total_order_value: 100,
    line_items: [{ sku: "TEST-TEE-001", quantity: 1, selling_price: 100, search_from_my_products: 0 }]
  };

  console.log("🚀 Starting Header Brute-Force Test...");

  // VARIATION 1: CamelCase (Documented)
  try {
    console.log("\nTrying Variation 1: ClientId / Accesstoken...");
    await axios.post(url, payload, {
      headers: { "Content-Type": "application/json", "ClientId": CLIENT_ID, "Accesstoken": CLIENT_SECRET }
    });
    console.log("✅ SUCCESS with Variation 1!");
    return;
  } catch (e) { console.log("❌ Failed:", e.response?.data || e.message); }

  // VARIATION 2: Lowercase (Standard)
  try {
    console.log("\nTrying Variation 2: clientid / accesstoken...");
    await axios.post(url, payload, {
      headers: { "Content-Type": "application/json", "clientid": CLIENT_ID, "accesstoken": CLIENT_SECRET }
    });
    console.log("✅ SUCCESS with Variation 2!");
    return;
  } catch (e) { console.log("❌ Failed:", e.response?.data || e.message); }

  // VARIATION 3: Hyphenated (Common Web Standard)
  try {
    console.log("\nTrying Variation 3: qt-client-id / qt-access-token...");
    await axios.post(url, payload, {
      headers: { "Content-Type": "application/json", "qt-client-id": CLIENT_ID, "qt-access-token": CLIENT_SECRET }
    });
    console.log("✅ SUCCESS with Variation 3!");
    return;
  } catch (e) { console.log("❌ Failed:", e.response?.data || e.message); }
}

debug();