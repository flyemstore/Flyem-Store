import axios from "axios";
import qs from "qs"; // Built-in query string formatter

// 1. PASTE YOUR NEW LIVE KEYS HERE
const CLIENT_ID = "410121978684652"; 
const CLIENT_SECRET = "1239447bdfb306467b0c33d349ff2243f77bf8c6f0f40203a8bc87540a39b592";

async function debugFinal() {
  const url = "https://api.qikink.com/api/order/create"; // Live URL
  
  const payload = {
    order_number: "TEST-" + Date.now(),
    qikink_shipping: 1,
    gateway: "COD",
    total_order_value: 100,
    line_items: [{ sku: "TEST-TEE-001", quantity: 1, selling_price: 100, search_from_my_products: 0 }]
  };

  console.log("🚀 Testing The 'Golden Combination'...");

  // ATTEMPT 1: Correct URL + qt- headers (The most likely fix)
  try {
    console.log("\nAttempt 1: URL + qt-access-token headers...");
    const res1 = await axios.post(url, payload, {
      headers: { 
        "Content-Type": "application/json",
        "qt-client-id": CLIENT_ID, 
        "qt-access-token": CLIENT_SECRET 
      }
    });
    console.log("✅ SUCCESS! (Use 'qt-access-token')");
    return;
  } catch (e) { console.log("❌ Failed:", e.response?.data || e.message); }

  // ATTEMPT 2: Form Data (Sometimes JSON is rejected)
  try {
    console.log("\nAttempt 2: Sending as Form Data...");
    const res2 = await axios.post(url, qs.stringify(payload), {
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "qt-client-id": CLIENT_ID, 
        "qt-access-token": CLIENT_SECRET 
      }
    });
    console.log("✅ SUCCESS! (Use Form Data)");
    return;
  } catch (e) { console.log("❌ Failed:", e.response?.data || e.message); }
}

debugFinal();