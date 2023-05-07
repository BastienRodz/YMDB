import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import './SearchMenu.css';
import { Movie } from '../../types.d';
import useDebounce from '../../hooks/useDebounce';
import MoviePoster from '../MoviePoster/MoviePoster';
import { useMovie } from '../../context/MovieContext';
import { ReactComponent as TomatoSvg } from '../../assets/food-tomato.svg';

interface SearchResult {
  page: number;
  total_results: number;
  total_pages: number;
  results: Movie[];
}

const BASE_URL = 'https://api.themoviedb.org/3/search/movie';

function SearchMenu() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const page = 1;
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isBottomBlurVisible, setIsBottomBlurVisible] = useState(false);
  const movieListRef = useRef<HTMLDivElement | null>(null);
  const [isTopBlurVisible, setIsTopBlurVisible] = useState(false);
  const { setSelectedMovie } = useMovie();

  useEffect(() => {
    if (debouncedSearchTerm) {
      const fetchMovies = async () => {
        const response = await fetch(
          `${BASE_URL}?api_key=${process.env.REACT_APP_API_KEY}&language=fr-FR&query=${debouncedSearchTerm}&page=${page}&include_adult=true`
        );
        const data: SearchResult = await response.json();
        setSearchResults(data.results);
      };
      fetchMovies();
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm, page]);

  function handleScroll(e: React.UIEvent<HTMLDivElement>): void {
    const target = e.target as HTMLDivElement;
    const isAtBottom =
      Math.ceil(target.scrollTop + target.clientHeight) >= target.scrollHeight;
    const isAtTop = target.scrollTop === 0;
    setIsBottomBlurVisible(!isAtBottom);
    setIsTopBlurVisible(!isAtTop);
  }

  useEffect(() => {
    if (movieListRef.current) {
      handleScroll({
        target: movieListRef.current,
      } as unknown as React.UIEvent<HTMLDivElement>);
    }
  }, [searchResults]);

  function handleSearch(e: ChangeEvent<HTMLInputElement>): void {
    setSearchTerm(e.target.value);
  }

  const movieDate = (movieItem: Movie) => {
    const date = new Date(movieItem.release_date).getFullYear();
    const str = `${date.toString()} `;
    return str;
  };

  const tomatoColor = (voteAverage: number) => {
    let hueRotateValue = 0;
    if (voteAverage >= 9) {
      hueRotateValue = 0;
    } else if (voteAverage >= 8) {
      hueRotateValue = 15;
    } else if (voteAverage >= 7) {
      hueRotateValue = 30;
    } else if (voteAverage >= 6) {
      hueRotateValue = 45;
    } else if (voteAverage >= 5) {
      hueRotateValue = 60;
    } else if (voteAverage >= 4) {
      hueRotateValue = 75;
    } else if (voteAverage >= 3) {
      hueRotateValue = 90;
    } else if (voteAverage >= 2) {
      hueRotateValue = 105;
    } else if (voteAverage >= 1) {
      hueRotateValue = 120;
    } else {
      hueRotateValue = 135;
    }
    return (
      <TomatoSvg
        style={{
          filter: `hue-rotate(${hueRotateValue}deg)`,
          maxHeight: '1.5em',
        }}
      />
    );
  };

  const movieRating = (movieItem: Movie) => {
    const { vote_average, vote_count } = movieItem;
    if (vote_count >= 20) {
      const img = tomatoColor(vote_average);
      return (
        <>
          <span style={{ marginLeft: '10px', marginRight: '10px' }}>-</span>
          {img}
          <span>{vote_average.toFixed(1).toString()}</span>
        </>
      );
    }
    return null;
  };

  const movieClassification = (movieItem: Movie) => {
    const { adult } = movieItem;
    if (adult)
      return (
        <>
          <span style={{ marginLeft: '10px', marginRight: '10px' }}>-</span>
          <span style={{ fontSize: '1.5em' }}>🔞</span>
        </>
      );
    return null;
  };

  const movieOverview = (movieItem: Movie) => {
    const { overview } = movieItem;
    if (!overview) return 'No overview available';
    if (overview.length > 140) return `${overview.substring(0, 140)}...`;
    return overview;
  };

  return (
    <div className="search-menu">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
        placeholder="Search for a movie..."
      />
      <div ref={movieListRef} className="movie-list" onScroll={handleScroll}>
        {isTopBlurVisible && (
          <div className="movie-list-top-blur">
            <i className="up-arrow" />
          </div>
        )}
        {isBottomBlurVisible && (
          <div className="movie-list-bottom-blur">
            <i className="down-arrow" />
          </div>
        )}
        {searchResults.map((movie) => (
          <button
            type="button"
            key={movie.id}
            className="movie-item"
            onClick={() => setSelectedMovie(movie)}
          >
            <div className="movie-item-image">
              <img src={MoviePoster(movie.poster_path, 92)} alt={movie.title} />
            </div>
            <div className="movie-info">
              <h3>{movie.title}</h3>
              <div className="movie-others">
                {movieDate(movie)}
                {movieRating(movie)}
                {movieClassification(movie)}
              </div>
              <p>
                <span className="movie-info-label">{movieOverview(movie)}</span>{' '}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SearchMenu;
