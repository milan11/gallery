import { useNavigate } from "react-router-dom";
import { Photo } from "./Data";
import { requestFullscreen } from "./Fullscreen";
import { sleep } from "./Utils";

type Props = {
  photos: Photo[];
};

export const GalleryList = (props: Props) => {
  const navigate = useNavigate();

  const renderListItem = (photo: Photo) => {
    return (
      <div
        key={photo.file}
        className="galleryPhoto"
        onClick={async () => {
          await requestFullscreen();
          await sleep(200);
          navigate({ pathname: "/photo/" + encodeURIComponent(photo.file) });
        }}
        style={{ cursor: "pointer" }}
      >
        <img
          className="galleryImage"
          src={
            process.env.PUBLIC_URL +
            "/data/default/s_" +
            encodeURIComponent(photo.file)
          }
          alt=""
        ></img>
        <div className="galleryDescription">{photo.description}</div>
      </div>
    );
  };

  return (
    <div className="galleryColumn">{props.photos.map(renderListItem)}</div>
  );
};
