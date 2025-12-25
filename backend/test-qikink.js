import axios from "axios";

// 1. PASTE YOUR KEYS HERE DIRECTLY (Inside quotes)
const CLIENT_ID = "410121978684652"; 
const CLIENT_SECRET = "1e79cd9a0c91a45f1746d3faad7065762dad34c24bd7ae04d1496ad7038428dd"; 

async function testQikink() {
  console.log("🚀 Testing Qikink Sandbox Connection...");
  console.log("Client ID:", CLIENT_ID);
  console.log("Secret Length:", CLIENT_SECRET.length);

  const payload = {
    "order_number": "TEST-" + Date.now(),
    "order_date": "2025-12-02",
    "first_name": "Test",
    "last_name": "User",
    "address1": "123 Street",
    "city": "Mumbai",
    "pincode": "400001",
    "email": "test@example.com",
    "phone": "9999999999",
    "state": "Maharashtra",
    "country": "India",
    "qikink_shipping": 1,
    "gateway": "COD",
    "total_order_value": 500,
    "line_items": [
      {
        "sku": "TEE-TEST-001", // Make sure this matches a dummy product or generic SKU
        "quantity": 1,
        "selling_price": 500,
        "search_from_my_products": 0 // Set to 0 for sandbox testing to avoid SKU lookup errors
      }
    ]
  };

  try {
    // Attempt 1: Standard Headers (Based on Docs)
    console.log("\n--- Attempt 1: Standard Headers ---");
    const res1 = await axios.post("https://sandbox.qikink.com/api/order/create", payload, {
      headers: {
        "Content-Type": "application/json",
        "ClientId": CLIENT_ID,
        "Accesstoken": CLIENT_SECRET
      }
    });
    console.log("✅ SUCCESS!", res1.data);
    return;
  } catch (err) {
    console.log("❌ Attempt 1 Failed:", err.response ? err.response.data : err.message);
  }

  try {
    // Attempt 2: Lowercase Headers (Common Fix)
    console.log("\n--- Attempt 2: Lowercase Headers ---");
    const res2 = await axios.post("https://sandbox.qikink.com/api/order/create", payload, {
      headers: {
        "Content-Type": "application/json",
        "clientid": CLIENT_ID,
        "accesstoken": CLIENT_SECRET
      }
    });
    console.log("✅ SUCCESS!", res2.data);
  } catch (err) {
    console.log("❌ Attempt 2 Failed:", err.response ? err.response.data : err.message);
  }
}

testQikink();