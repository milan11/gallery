import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { GalleryFullscreen } from "./GalleryFullscreen";
import { GalleryList } from "./GalleryList";
import { dimensionsSortIndex, GalleryData } from "./Data";

export const Gallery = () => {
  const { gallery } = useParams();

  const [galleryData, setGalleryData] = useState<GalleryData | null>(null);

  const [sortByDimensions, setSortByDimensions] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      const response = await fetch(
        process.env.PUBLIC_URL +
          "/data/" +
          encodeURIComponent(gallery!) +
          "/_data.json"
      );

      if (response.ok) {
        const data = await response.json();
        setGalleryData(data);
      }
    };
    fetchPhotos();
  }, [gallery]);

  useEffect(() => {
    if (galleryData !== null && galleryData.title) {
      document.title = galleryData.title;
    }
  });

  const galleryDataWithSortedPhotos = useMemo(() => {
    if (galleryData === null) {
      return null;
    }
    return {
      ...galleryData,
      photos: sortByDimensions
        ? [...galleryData.photos].sort(
            (a, b) => dimensionsSortIndex(a) - dimensionsSortIndex(b)
          )
        : galleryData.photos,
    };
  }, [galleryData, sortByDimensions]);

  if (galleryDataWithSortedPhotos === null) {
    return null;
  }

  return (
    <Routes>
      <Route
        path=""
        element={
          <GalleryList
            galleryData={galleryDataWithSortedPhotos}
            sortByDimensions={sortByDimensions}
            setSortByDimensions={setSortByDimensions}
          />
        }
      ></Route>
      <Route
        path="photo/:file"
        element={
          <GalleryFullscreen photos={galleryDataWithSortedPhotos.photos} />
        }
      ></Route>
    </Routes>
  );
};
