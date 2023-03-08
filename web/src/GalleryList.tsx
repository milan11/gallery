import { useNavigate, useParams } from "react-router-dom";
import { GalleryData, isPortrait, Photo } from "./Data";
import { requestFullscreen } from "./Fullscreen";
import { SizedImage } from "./SizedImage";
import { sleep } from "./Utils";

type Props = {
  galleryData: GalleryData;
  sortByDimensions: boolean;
  setSortByDimensions: (sortByDimensions: boolean) => void;
};

export const GalleryList = (props: Props) => {
  const { gallery } = useParams();
  const navigate = useNavigate();

  const renderListItem = (photo: Photo) => {
    return (
      <div
        key={photo.file}
        className="galleryPhoto"
        onClick={async () => {
          await requestFullscreen();
          await sleep(200);
          navigate({
            pathname:
              "/gallery/" +
              encodeURIComponent(gallery!) +
              "/photo/" +
              encodeURIComponent(photo.file),
          });
        }}
        style={{ cursor: "pointer" }}
      >
        <SizedImage
          src={
            process.env.PUBLIC_URL +
            "/data/" +
            encodeURIComponent(gallery!) +
            "/s_" +
            encodeURIComponent(photo.file)
          }
          width={photo.s_width}
          height={photo.s_height}
          lazy={true}
          className="galleryImage"
        />

        <div className="galleryDescription">{photo.description}</div>
      </div>
    );
  };

  return (
    <div className="galleryColumn">
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        <a
          href={process.env.PUBLIC_URL + "/"}
          className="link"
          style={{ flexGrow: "1" }}
        >
          ← {props.galleryData.title}
        </a>
        {props.galleryData.photos.some((p) => isPortrait(p)) &&
          props.galleryData.photos.some((p) => !isPortrait(p)) && (
            <button
              style={{ border: "none" }}
              onClick={() => props.setSortByDimensions(!props.sortByDimensions)}
            >
              {props.sortByDimensions
                ? "sorting by dimensions"
                : "sorting by date"}
            </button>
          )}
      </div>
      {props.galleryData.photos.map(renderListItem)}
    </div>
  );
};
