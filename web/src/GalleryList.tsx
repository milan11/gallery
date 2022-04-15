import { useNavigate, useParams } from "react-router-dom";
import { Photo } from "./Data";
import { requestFullscreen } from "./Fullscreen";
import { SizedImage } from "./SizedImage";
import { sleep } from "./Utils";

type Props = {
  photos: Photo[];
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
          className="galleryImage"
        />

        <div className="galleryDescription">{photo.description}</div>
      </div>
    );
  };

  return (
    <div className="galleryColumn">{props.photos.map(renderListItem)}</div>
  );
};
