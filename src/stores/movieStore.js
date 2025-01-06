import { defineStore } from 'pinia';

export const useMovieStore = defineStore('movie', {
  state: () => ({
    movies: []
  }),
  actions: {
    setMovies(movies) {
      this.movies = movies;
    }
  }
}); 