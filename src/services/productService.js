const API_URL = "https://api.fda.gov/drug/label.json?limit=50";
import mockProducts, { medicines as mockMedicines } from "./mockProducts";

export async function getMedicines() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    // Map FDA response to your app structure
    const medicines = data.results.map((item, index) => ({
      id: index.toString(),
      name:
        item.openfda?.brand_name?.[0] ||
        item.openfda?.generic_name?.[0] ||
        "Unknown Medicine",
      price: Math.floor(Math.random() * 200) + 50, // demo price
      category: "medicines",
      brand: item.openfda?.manufacturer_name?.[0] || "Generic",
      usage: item.indications_and_usage?.[0] || "Consult doctor",
    }));

    return medicines;
  } catch (error) {
    console.error("Failed to fetch medicines, falling back to mock data:", error);
    return mockMedicines;
  }
}

export async function getProductsByCategory(category) {
  // Normalize category slug (remove non-alphanumeric chars)
  const slug = (category || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  switch (slug) {
    case "medicines":
      return getMedicines();
    case "diabetes":
      return Promise.resolve(mockProducts.diabetes);
    case "vitamins":
      return Promise.resolve(mockProducts.vitamins);
    case "personalcare":
      return Promise.resolve(mockProducts.personalCare);
    default:
      // When unknown category, return all medicines as default
      return getMedicines();
  }
}
