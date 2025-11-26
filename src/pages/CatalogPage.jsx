import { useState } from "react";
import { getMedicines } from "../services/productService";
import ProductCard from "../components/ProductCard";
import FilterPanel from "../components/FilterPanel";
import SearchBar from "../components/SearchBar";

function CatalogPage() {
  const allMedicines = getMedicines();
  const [filters, setFilters] = useState({ category: "", brand: "" });
  const [search, setSearch] = useState("");

  const filteredMedicines = allMedicines.filter((med) => {
    return (
      (filters.category ? med.category === filters.category : true) &&
      (filters.brand ? med.brand === filters.brand : true) &&
      (search ? med.name.toLowerCase().includes(search.toLowerCase()) : true)
    );
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Medicine Catalog</h1>
      <SearchBar search={search} setSearch={setSearch} />
      <FilterPanel filters={filters} setFilters={setFilters} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredMedicines.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default CatalogPage;
