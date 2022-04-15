import { useEffect, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { GalleryFullscreen } from "./GalleryFullscreen";
import { GalleryList } from "./GalleryList";
import { GalleryData } from "./Data";

export const Gallery = () => {
  const { gallery } = useParams();

  const [galleryData, setGalleryData] = useState<GalleryData | null>(null);

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

  if (galleryData === null) {
    return null;
  }

  return (
    <Routes>
      <Route
        path=""
        element={<GalleryList photos={galleryData.photos} />}
      ></Route>
      <Route
        path="photo/:file"
        element={<GalleryFullscreen photos={galleryData.photos} />}
      ></Route>
    </Routes>
  );
};
