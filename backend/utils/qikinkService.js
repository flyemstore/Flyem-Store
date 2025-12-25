import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// 👇 SANDBOX URL CONFIGURATION
const BASE_URL = "https://sandbox.qikink.com"; 

// 1. Get Access Token
const getAccessToken = async () => {
  try {
    const params = new URLSearchParams();
    params.append('ClientId', process.env.QIKINK_CLIENT_ID);
    params.append('client_secret', process.env.QIKINK_CLIENT_SECRET);
    
    const response = await axios.post(`${BASE_URL}/api/token`, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    if (response.data && response.data.Accesstoken) {
      return response.data.Accesstoken;
    } else {
      throw new Error("No access token returned");
    }
  } catch (error) {
    console.error("❌ Qikink Auth Failed:", error.response?.data || error.message);
    return null;
  }
};

// 2. Create Order
export const createQikinkOrder = async (order) => {
  console.log("🏭 Initializing Qikink Sync (Sandbox) for Order:", order._id);

  const token = await getAccessToken();
  if (!token) return null; 

  const safeState = order.shippingAddress.state || "Maharashtra";
  
  // Determine Gateway based on payment method
  const gatewayType = order.paymentMethod === "COD" ? "COD" : "Prepaid";

  const payload = {
      order_number: "ORD" + order._id.toString().slice(-6),
      qikink_shipping: 1,
      gateway: gatewayType, // ✅ Dynamically set based on order
      total_order_value: order.totalPrice,

      shipping_address: {
        first_name: order.user?.name?.split(" ")[0] || "Customer",
        last_name: order.user?.name?.split(" ")[1] || ".",
        address1: order.shippingAddress.address,
        city: order.shippingAddress.city,
        zip: order.shippingAddress.zip,
        province: safeState, 
        country_code: "IN",
        phone: order.shippingAddress.phone,
        email: order.user?.email || "no-email@flyem.com"
      },

      line_items: order.orderItems.map(item => ({
        search_from_my_products: "0", 
        sku: item.sku, // ✅ This will now use the real SKU from your DB
        quantity: item.quantity,
        price: item.price,
        print_type_id: 1
      }))
    };

  // 👇 FIXED: Changed 'orderData' to 'payload' to prevent crash
  console.log("---------------- QIKINK SYNC START ----------------");
  console.log("PAYLOAD BEING SENT TO QIKINK:");
  console.log(JSON.stringify(payload, null, 2)); 
  console.log("---------------------------------------------------");

  try {
    const response = await axios.post(
      `${BASE_URL}/api/order/create`, 
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "ClientId": process.env.QIKINK_CLIENT_ID,
          "Accesstoken": token
        }
      }
    );

    console.log("✅ Qikink Sandbox Order Created! Response:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Qikink API Error Response:", error.response?.data || error.message);
    return null;
  }
};