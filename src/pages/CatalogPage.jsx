import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getProductsByCategory } from "../services/productService";
import ProductCard from "../components/ProductCard";
import FilterPanel from "../components/FilterPanel";
import SearchBar from "../components/SearchBar";

function CatalogPage() {
  const [allMedicines, setAllMedicines] = useState([]);
  const [filters, setFilters] = useState({ category: "", brand: "" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Fetch products by category query param
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const category = params.get("category") || "";
      if (category) setFilters((f) => ({ ...f, category }));

      const data = await getProductsByCategory(category);
      setAllMedicines(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, [location.search]);

  // Filter + search
  const filteredMedicines = allMedicines.filter((med) => {
    return (
      (filters.category ? med.category === filters.category : true) &&
      (filters.brand ? med.brand === filters.brand : true) &&
      (search
        ? med.name.toLowerCase().includes(search.toLowerCase())
        : true)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredMedicines.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMedicines = filteredMedicines.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Reset page on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, search]);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "20px" }}>Loading products...</p>;
  }

  return (
    <div style={{ width: "100%" }}>
      <h1 className="text-2xl font-bold mb-4">Catalog</h1>

      <SearchBar search={search} setSearch={setSearch} />
      <FilterPanel filters={filters} setFilters={setFilters} />

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {paginatedMedicines.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination (FORCED CENTER) */}
      {totalPages > 1 && (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginTop: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              style={{
                padding: "8px 16px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                cursor: "pointer",
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              Prev
            </button>

            <span style={{ fontWeight: 600 }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 16px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                cursor: "pointer",
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CatalogPage;
