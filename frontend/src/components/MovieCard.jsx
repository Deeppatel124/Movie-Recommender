import { useState } from "react";
import { getMovieTrailer } from "../api/tmdb";

const MovieCard = ({ movie }) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);

  const handleTrailerClick = async () => {
    setLoadingTrailer(true);
    const url = await getMovieTrailer(movie.id);
    setTrailerUrl(url);
    setLoadingTrailer(false);
    setShowTrailer(true);
  };

  return (
    <>
      {/* Movie Card */}
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
        
        {/* Poster */}
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-72 object-cover"
          />
        ) : (
          <div className="w-full h-72 bg-gray-700 flex items-center justify-center text-gray-400">
            No Poster
          </div>
        )}

        {/* Details */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-white font-bold text-lg mb-1 truncate">
            {movie.title}
          </h3>

          {/* Rating and Year */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-yellow-400 font-semibold">⭐ {movie.rating}</span>
            <span className="text-gray-400 text-sm">{movie.year}</span>
          </div>

          {/* Genre Badges */}
          <div className="flex flex-wrap gap-1 mb-3">
            {movie.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Overview */}
          <p className="text-gray-400 text-sm line-clamp-3 mb-3">
            {movie.overview}
          </p>

          {/* Trailer Button */}
          <button
            onClick={handleTrailerClick}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors duration-200"
          >
            {loadingTrailer ? "Loading..." : "▶ Watch Trailer"}
          </button>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="bg-gray-900 rounded-xl overflow-hidden w-full max-w-3xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4">
              <h2 className="text-white font-bold text-xl">{movie.title}</h2>
              <button
                onClick={() => setShowTrailer(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Trailer or No Trailer Message */}
            {trailerUrl ? (
              <iframe
                src={trailerUrl}
                className="w-full h-72 md:h-96"
                allowFullScreen
                title={movie.title}
              />
            ) : (
              <div className="text-gray-400 text-center p-8">
                No trailer available for this movie.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MovieCard;