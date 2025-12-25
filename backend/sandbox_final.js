import axios from "axios";

// ⚠️ PASTE YOUR NEW KEYS HERE DIRECTLY (Keep the quotes!)
const CLIENT_ID = "410121978684652"; 
const CLIENT_SECRET = "3d1a7f474e77d1ddd689011340c59a802bde59923020310fe65fa5054b2a1033"; 

async function runTest() {
  console.log("\n🚀 INITIALIZING SANDBOX TEST...");
  console.log("Target: https://sandbox.qikink.com/api/order/create");
  console.log(`Client ID: ${CLIENT_ID}`);
  console.log(`Secret Length: ${CLIENT_SECRET.length} (Should be 64)`);

  // Payload exactly as per Qikink Postman Docs
  const payload = {
    "order_number": "TEST-" + Date.now(),
    "qikink_shipping": 1,
    "gateway": "COD",
    "total_order_value": 100,
    "line_items": [
      {
        "sku": "TEE-TEST",
        "quantity": 1,
        "selling_price": 100,
        "search_from_my_products": 0 // Critical for Sandbox
      }
    ]
  };

  try {
    // ATTEMPT 1: Headers exactly as seen in your Postman screenshot
    console.log("\n📡 Sending Request...");
    
    const response = await axios.post(
      "https://sandbox.qikink.com/api/order/create", 
      payload, 
      {
        headers: {
          "Content-Type": "application/json",
          "ClientId": CLIENT_ID.trim(),      // Case Sensitive: ClientId
          "Accesstoken": CLIENT_SECRET.trim() // Case Sensitive: Accesstoken
        }
      }
    );

    console.log("\n✅ SUCCESS! CONNECTED TO SANDBOX.");
    console.log("Response:", response.data);

  } catch (error) {
    console.log("\n❌ FAILED.");
    if (error.response) {
      console.log("Status Code:", error.response.status);
      console.log("Server Message:", error.response.data);
    } else {
      console.log("Error:", error.message);
    }
  }
}

runTest();