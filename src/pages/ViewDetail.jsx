import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getMovieEndpoint,
  getTvEndpoint,
  getMovieDetail,
} from "../utils/helper";
import { MdFavorite, MdBookmarkAdd } from "react-icons/md";
import { IoMdPlay } from "react-icons/io";
import TrailerModal from "../components/TrailerModal";
import { handleBookmark, handleFavorite } from "../utils/helper";

const bgImageBaseUrl = import.meta.env.VITE_BG_IMAGE_BASE_URL;

const ViewDetail = () => {
  const { type, detail } = useParams();
  const [movie, setMovie] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [bookmark, setBookmark] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    // check if movie in favorites list
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const isFavorite = favorites.some((item) => item.id === movie?.id);
    setFavorite(isFavorite);

    // check if movie in bookmarks
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    const isBookmark = bookmarks.some((item) => item.id === movie?.id);
    setBookmark(isBookmark);
  }, [movie?.id]);

  useEffect(() => {
    const getMovie = async () => {
      try {
        const id = detail.split("-")[0] || "";

        const endpoint =
          type === "movie"
            ? getMovieEndpoint(type, id)
            : getTvEndpoint(type, id);

        await getMovieDetail(endpoint).then((data) => {
          data.trailer =
            data.videos.results.find(
              (trailer) => trailer.name.toLowerCase() === "official trailer"
            ) ||
            data.videos.results[0] ||
            [];
          setMovie(data);
        });
      } catch (error) {
        console.error("Error accessing api data: ", error);
      }
    };

    getMovie();
  }, [type, detail]);

  const formatRuntime = (runtime) => {
    const hour = Math.floor(runtime / 60);
    const mins = runtime % 60;
    return `${hour}h${mins}m`;
  };
  return (
    <section ref={scrollRef} className="relative">
      <div
        className=" min-h-[500px] bg-cover bg-no-repeat bg-center flex flex-wrap md:flex-nowrap justify-center gap-10 p-10"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(157.5, 199.5, 220.5, 1) calc((50vw - 170px) - 340px), rgba(157.5, 199.5, 220.5, 0.84) 50%, rgba(157.5, 199.5, 220.5, 0.84) 100%),url(${bgImageBaseUrl}${movie?.backdrop_path})`,
        }}
      >
        {/* movie image */}

        <img
          className="h-[450px] min-w-[300px] rounded-lg"
          src={bgImageBaseUrl + movie?.poster_path}
          alt={movie?.original_title || movie?.original_name}
        />

        {/* movie details */}
        <div className="">
          <div className=" my-1 font-semibold  text-2xl md:text-4xl ">
            {movie?.original_title || movie?.original_name || "unknown"}
            {movie?.release_date || movie?.first_air_date ? (
              <span className="font-normal">
                {" "}
                (
                {(movie?.release_date || movie?.first_air_date)?.split(
                  "-"
                )[0] || ""}
                )
              </span>
            ) : null}
          </div>

          {/* movie release dat, genre and runtime */}
          <div>
            {movie?.release_date || movie?.first_air_date ? (
              <span className="">
                {(movie?.release_date || movie?.first_air_date)
                  ?.split("-")
                  .reverse()
                  .join("/")}{" "}
                ({movie?.origin_country[0] || ""})
              </span>
            ) : null}
            <ul className="list-disc inline-block ml-6">
              {movie?.genres && (
                <li>{movie.genres.map((genre) => genre.name).join(", ")}</li>
              )}
            </ul>
            {movie?.runtime ? (
              <ul className="list-disc inline-block ml-6">
                <li>{formatRuntime(movie.runtime)}</li>
              </ul>
            ) : (
              ""
            )}
          </div>

          {/* User score */}
          <div className=" flex justify-start items-center gap-3">
            <div className="text-white flex justify-center items-center bg-black h-[60px] w-[60px] rounded-full my-3 p-[3px]">
              <div
                className="h-full w-full rounded-full p-[3px] flex justify-center items-center"
                style={{
                  background: `conic-gradient(yellow ${
                    movie?.vote_average * 10 || 0
                  }%,grey 0)`,
                }}
              >
                <div className="bg-black h-full w-full relative rounded-full flex justify-center items-center font-bold">
                  {Math.floor(movie?.vote_average * 10) || "NR"}
                  {movie?.vote_average > 0 ? (
                    <span className="absolute text-[9px] left-[33px] top-4">
                      %
                    </span>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>

            <div className="font-bold">
              <p>User</p>
              <p>Score</p>
            </div>
          </div>

          {/* favorite, add to list and plya trailer */}
          <div className="flex justify-start items-center gap-3">
            <button
              onClick={() => handleFavorite(movie, favorite, setFavorite)}
              className="bg-slate-700 rounded-full h-10 w-10 flex justify-center items-center"
            >
              <MdFavorite color={favorite ? "red" : "white"} />
            </button>
            <button
              onClick={() => handleBookmark(movie, bookmark, setBookmark)}
              className="bg-slate-700 rounded-full h-10 w-10 flex justify-center items-center"
            >
              <MdBookmarkAdd color={bookmark ? "red" : "white"} />
            </button>
            <button
              onClick={() => setIsVisible(true)}
              className="font-bold hover:text-white flex justify-center items-center gap-2"
            >
              <IoMdPlay /> <span>Play Trailer</span>
            </button>
          </div>

          {/* movie overview */}
          <div className="my-5">
            {movie?.tagline ? <p className="">{movie.tagline}</p> : ""}
            <h4 className="font-bold mt-1 text-lg">Overview</h4>
            <p>{movie?.overview}</p>
          </div>
        </div>
      </div>

      {/* trailer modal */}
      {isVisible && (
        <TrailerModal movieDetail={movie} setVisible={setIsVisible} />
      )}
    </section>
  );
};

export default ViewDetail;
