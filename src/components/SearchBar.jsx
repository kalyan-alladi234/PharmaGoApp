function SearchBar({ search, setSearch }) {
  return (
    <input
      type="text"
      placeholder="Search medicines..."
      className="w-full p-2 border rounded mb-4"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );
}

export default SearchBar;
