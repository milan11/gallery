import { useEffect, useState } from "react";
import { GalleriesData } from "./Data";

export const GalleriesList = () => {
  const [galleriesData, setGalleriesData] = useState<GalleriesData | null>(
    null
  );

  const fetchGalleries = async () => {
    const response = await fetch(
      process.env.PUBLIC_URL + "/data/_galleries.json"
    );

    if (response.ok) {
      const data = await response.json();
      setGalleriesData(data);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  if (galleriesData === null) {
    return null;
  }

  return (
    <div className="galleriesList">
      {galleriesData.galleries.map((g) => (
        <a
          key={g.path}
          href={
            process.env.PUBLIC_URL + "/gallery/" + encodeURIComponent(g.path)
          }
          className="link"
        >
          {g.label}
        </a>
      ))}
    </div>
  );
};
