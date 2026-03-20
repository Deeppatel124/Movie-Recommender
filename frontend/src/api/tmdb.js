const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// Get movie details (poster, rating, year, genres) using TMDB movie ID
export const getMovieDetails = async (movieId) => {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
  );
  const data = await response.json();
  return {
    id: data.id,
    title: data.title,
    poster: data.poster_path ? `${IMAGE_BASE_URL}${data.poster_path}` : null,
    rating: data.vote_average ? data.vote_average.toFixed(1) : "N/A",
    year: data.release_date ? data.release_date.split("-")[0] : "N/A",
    overview: data.overview,
    genres: data.genres ? data.genres.map((g) => g.name) : [],
  };
};

// Get movie trailer (YouTube link) using TMDB movie ID
export const getMovieTrailer = async (movieId) => {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`
  );
  const data = await response.json();

  // Find the first YouTube trailer
  const trailer = data.results.find(
    (vid) => vid.site === "YouTube" && vid.type === "Trailer"
  );

  return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
};