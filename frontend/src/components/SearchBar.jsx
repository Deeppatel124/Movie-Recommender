import { useState } from "react";

const SearchBar = ({ movies, onSearch, loading }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1); // -1 means nothing selected

  // Filter movie titles as user types
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1); // Reset selection on new input

    if (value.length > 1) {
      const filtered = movies
        .filter((title) => title.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 6);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // When user clicks a suggestion
  const handleSuggestionClick = (title) => {
    setQuery(title);
    setSuggestions([]);
    setActiveIndex(-1);
    onSearch(title);
  };

  // When user clicks Search button
  const handleSearch = () => {
    if (query.trim()) {
      setSuggestions([]);
      setActiveIndex(-1);
      onSearch(query.trim());
    }
  };

  // Arrow keys + Enter navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSuggestionClick(suggestions[activeIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Input + Button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search a movie..."
          className="w-full px-5 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? "..." : "Search"}
        </button>
      </div>

      {/* Autocomplete Suggestions */}
      {suggestions.length > 0 && (
        <ul className="absolute top-14 left-0 right-0 bg-gray-800 rounded-xl shadow-lg z-10 overflow-hidden">
          {suggestions.map((title, index) => (
            <li
              key={title}
              onClick={() => handleSuggestionClick(title)}
              className={`px-5 py-3 text-white cursor-pointer transition-colors duration-150
                ${index === activeIndex ? "bg-blue-600" : "hover:bg-gray-700"}`}
            >
              {title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;