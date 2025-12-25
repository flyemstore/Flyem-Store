import api from "./index";

export async function fetchCatalog() {
  // Matches the backend route /api/products
  return api.request("/products"); 
}

export async function fetchProductById(id) {
  return api.request(`/products/${id}`);
}