import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GalleryFullscreen } from "./GalleryFullscreen";
import { GalleryList } from "./GalleryList";
import { GalleryData } from "./Data";

export const Gallery = () => {
  const [galleryData, setGalleryData] = useState<GalleryData | null>(null);

  const fetchPhotos = async () => {
    const response = await fetch(
      process.env.PUBLIC_URL + "/data/default/_data.json"
    );

    if (response.ok) {
      const data = await response.json();
      setGalleryData(data);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (galleryData !== null && galleryData.title) {
      document.title = galleryData.title;
    }
  });

  if (galleryData === null) {
    return null;
  }

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route
          path="/"
          element={<GalleryList photos={galleryData.photos} />}
        ></Route>
        <Route
          path="/photo/:file"
          element={<GalleryFullscreen photos={galleryData.photos} />}
        ></Route>
      </Routes>
    </Router>
  );
};
