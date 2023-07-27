import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import {
  createAsyncThunk
} from "@reduxjs/toolkit";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../utils/firebase-config";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { API_KEY, TMDB_BASE_URL } from "../utils/constants";
import SelectGenre from "../components/SelectGenre";
import axios from "axios";
import Slider from "../components/Slider";
import NotAvailable from "../components/NotAvailable";

function MoviePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const movies = useSelector((state) => state.netflix.movies);
  const genres = useSelector((state) => state.netflix.genres);
  const genresLoaded = useSelector((state) => state.netflix.genresLoaded);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const getGenres = createAsyncThunk("netflix/genres", async () => {
      const {
        data: { genres },
      } = await axios.get(
        "https://api.themoviedb.org/3/genre/movie/list?api_key=174b9b0ac802be24ade7f2956faba9ba"
      );
      return genres;
    });
    dispatch(getGenres());
  }, [dispatch]);

  useEffect(() => {
    const createArrayFromRawData = (array, moviesArray, genres) => {
      array.forEach((movie) => {
        const movieGenres = [];
        movie.genre_ids.forEach((genre) => {
          const name = genres.find(({ id }) => id === genre);
          if (name) movieGenres.push(name.name);
        });
        if (movie.backdrop_path)
          moviesArray.push({
            id: movie.id,
            name: movie?.original_name ? movie.original_name : movie.original_title,
            image: movie.backdrop_path,
            genres: movieGenres.slice(0, 3),
          });
      });
    };

    const getRawData = async (api, genres, paging = false) => {
      const moviesArray = [];
      for (let i = 1; moviesArray.length < 60 && i < 10; i++) {
        const {
          data: { results },
        } = await axios.get(`${api}${paging ? `&page=${i}` : ""}`);
        createArrayFromRawData(results, moviesArray, genres);
      }
      return moviesArray;
    };
    const fetchMovies = createAsyncThunk(
      "netflix/trending",
      async ({ type }, thunkAPI) => {
        const {
          netflix: { genres },
        } = thunkAPI.getState();
        return getRawData(
          `${TMDB_BASE_URL}/trending/${type}/week?api_key=${API_KEY}`,
          genres,
          true
        );
      }
    );
    if (genresLoaded) {
      dispatch(fetchMovies({ genres, type: "movie" }));
    }
  }, [dispatch, genres, genresLoaded]);

  const [ setUser] = useState(undefined);

  onAuthStateChanged(firebaseAuth, (currentUser) => {
    if (currentUser) setUser(currentUser.uid);
    else navigate("/login");
  });

  window.onscroll = () => {
    setIsScrolled(window.pageYOffset === 0 ? false : true);
    return () => (window.onscroll = null);
  };

  return (
    <Container>
      <div className="navbar">
        <Navbar isScrolled={isScrolled} />
      </div>
      <div className="data">
        <SelectGenre genres={genres} type="movie" />
        {movies.length ? <Slider movies={movies} /> : <NotAvailable />}
      </div>
    </Container>
  );
}

const Container = styled.div`
  .data {
    margin-top: 8rem;
    .not-available {
      text-align: center;
      color: white;
      margin-top: 4rem;
    }
  }
`;
export default MoviePage;
