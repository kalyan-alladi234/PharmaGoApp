function FilterPanel({ filters, setFilters }) {
  return (
    <div className="border p-4 rounded shadow mb-4">
      <h4 className="font-semibold mb-2">Filters</h4>
      <div className="space-y-2">
        <select
          className="w-full p-2 border rounded"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="Pain Relief">Pain Relief</option>
          <option value="Antibiotics">Antibiotics</option>
          <option value="Allergy">Allergy</option>
          <option value="Supplements">Supplements</option>
        </select>

        <select
          className="w-full p-2 border rounded"
          value={filters.brand}
          onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
        >
          <option value="">All Brands</option>
          <option value="MediCare">MediCare</option>
          <option value="PharmaPlus">PharmaPlus</option>
          <option value="HealthLife">HealthLife</option>
          <option value="NutriBoost">NutriBoost</option>
        </select>
      </div>
    </div>
  );
}

export default FilterPanel;
