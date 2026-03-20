import { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import MovieCard from "./components/MovieCard";
import { getMovieDetails } from "./api/tmdb";

const App = () => {
  const [allMovies, setAllMovies] = useState([]);       // All movie titles from ML model
  const [recommendations, setRecommendations] = useState([]); // Recommended movies with details
  const [watchlist, setWatchlist] = useState([]);       // Saved movies
  const [loading, setLoading] = useState(false);        // Search loading state
  const [error, setError] = useState(null);             // Error message
  const [showWatchlist, setShowWatchlist] = useState(false); // Toggle watchlist view
  const [searched, setSearched] = useState(false);      // Whether user has searched yet

  // Fetch all movie titles from FastAPI when app loads (for autocomplete)
  useEffect(() => {
    fetch("http://localhost:8000/movies")
      .then((res) => res.json())
      .then((data) => setAllMovies(data.movies))
      .catch(() => setError("Could not connect to backend. Make sure FastAPI is running."));
  }, []);

  // Called when user searches a movie
  const handleSearch = async (movieTitle) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    setRecommendations([]);

    try {
      // Step 1: Get recommended movie IDs from FastAPI
      const res = await fetch(
        `http://localhost:8000/recommend?movie=${encodeURIComponent(movieTitle)}`
      );

      if (!res.ok) {
        setError("Movie not found in dataset. Try another movie.");
        setLoading(false);
        return;
      }

      const data = await res.json();

      // Step 2: For each recommended movie, fetch details from TMDB
      const detailedMovies = await Promise.all(
        data.recommendations.map((movie) => getMovieDetails(movie.movie_id))
      );

      setRecommendations(detailedMovies);
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  // Add movie to watchlist
  const handleAddToWatchlist = (movie) => {
    if (!watchlist.find((m) => m.id === movie.id)) {
      setWatchlist([...watchlist, movie]);
    }
  };

  // Remove movie from watchlist
  const handleRemoveFromWatchlist = (movieId) => {
    setWatchlist(watchlist.filter((m) => m.id !== movieId));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* ── Header ── */}
      <header className="bg-gray-800 shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-400">🎬 Movie Recommender</h1>
        <button
          onClick={() => setShowWatchlist(!showWatchlist)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
        >
          🔖 Watchlist ({watchlist.length})
        </button>
      </header>

      <main className="px-6 py-10 max-w-7xl mx-auto">

        {/* ── Watchlist View ── */}
        {showWatchlist ? (
          <div>
            <div className="flex items-center gap-4 mb-6">
  <button
    onClick={() => setShowWatchlist(false)}
    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
  >
    ← Back to Home
  </button>
  <h2 className="text-2xl font-bold">Your Watchlist</h2>
</div>
            {watchlist.length === 0 ? (
              <p className="text-gray-400 text-center mt-20">
                No movies in your watchlist yet. Search and add some! 🎬
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {watchlist.map((movie) => (
                  <div key={movie.id} className="relative">
                    <MovieCard movie={movie} />
                    <button
                      onClick={() => handleRemoveFromWatchlist(movie.id)}
                      className="mt-2 w-full bg-red-700 hover:bg-red-800 text-white text-sm py-1 rounded-lg transition-colors duration-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        ) : (

          /* ── Main Search View ── */
          <div>
            {/* Hero Text */}
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold mb-3">Find Your Next Movie 🍿</h2>
              <p className="text-gray-400 text-lg">
                Search any movie and get 5 personalized recommendations instantly
              </p>
            </div>

            {/* Search Bar */}
            <SearchBar
              movies={allMovies}
              onSearch={handleSearch}
              loading={loading}
            />

            {/* Error Message */}
            {error && (
              <p className="text-red-400 text-center mt-6">{error}</p>
            )}

            {/* Loading State */}
            {loading && (
              <p className="text-gray-400 text-center mt-10 text-lg animate-pulse">
                Finding recommendations...
              </p>
            )}

            {/* Recommendations Grid */}
            {!loading && recommendations.length > 0 && (
              <div className="mt-10">
                <h2 className="text-2xl font-bold mb-6">Recommended Movies</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {recommendations.map((movie) => (
                    <div key={movie.id}>
                      <MovieCard movie={movie} />
                      <button
                        onClick={() => handleAddToWatchlist(movie)}
                        className="mt-2 w-full bg-green-700 hover:bg-green-800 text-white text-sm py-1 rounded-lg transition-colors duration-200"
                      >
                        + Watchlist
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State — before user searches */}
            {!loading && !searched && (
              <div className="text-center mt-24 text-gray-600">
                <p className="text-6xl mb-4">🎥</p>
                <p className="text-xl">Start by searching a movie above</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;