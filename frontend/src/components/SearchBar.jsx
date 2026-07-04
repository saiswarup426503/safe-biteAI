import { Search } from "lucide-react";

function SearchBar({ query, setQuery }) {
  return (
    <div className="search">
      <Search size={20} />
      <input
        type="text"
        placeholder="Search restaurants, cuisines, dishes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;