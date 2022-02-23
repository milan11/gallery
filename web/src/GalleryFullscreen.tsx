import { GlobalHotKeys } from "react-hotkeys";
import { useNavigate, useParams } from "react-router-dom";
import { Photo } from "./Data";
import { exitFullscreen, requestFullscreen } from "./Fullscreen";
import { SizedImage } from "./SizedImage";
import { sleep } from "./Utils";

type Props = {
  photos: Photo[];
};

const keyMap = {
  PREVIOUS: ["left", "up"],
  NEXT: ["right", "down", "space", "enter"],
  EXIT: ["esc"],
};

export const GalleryFullscreen = (props: Props) => {
  const navigate = useNavigate();

  const { file } = useParams();

  const openedPhotoIndex = props.photos.findIndex(
    (photo) => photo.file === file
  );
  if (openedPhotoIndex === -1) {
    return null;
  }

  const renderPhotoFs = (photo: Photo, nextPhoto: Photo | null) => {
    const handlers = {
      PREVIOUS: () => goPrevious(),
      NEXT: () => goNext(),
      EXIT: () => goExit(),
    };

    return (
      <div
        className="galleryPhotoFsWrapper"
        onClick={() => {
          goNext();
        }}
      >
        <GlobalHotKeys
          key={openedPhotoIndex}
          keyMap={keyMap}
          handlers={handlers}
        />
        <div className="galleryTopFs"></div>

        <div className="galleryPhotoFs">
          {[
            <SizedImage
              key={photo.file}
              src={
                process.env.PUBLIC_URL +
                "/data/default/l_" +
                encodeURIComponent(photo.file)
              }
              width={photo.l_width}
              height={photo.l_height}
              className="galleryImageFs"
            />,
            nextPhoto === null ? null : (
              <SizedImage
                key={nextPhoto.file}
                src={
                  process.env.PUBLIC_URL +
                  "/data/default/l_" +
                  encodeURIComponent(nextPhoto.file)
                }
                width={photo.l_width}
                height={photo.l_height}
                className="galleryImageFsNext"
              />
            ),
          ]}
        </div>

        {photo.description ? (
          <div className="galleryDescriptionFs">{photo.description}</div>
        ) : (
          <div className="galleryDescriptionFsNone">{photo.description}</div>
        )}
      </div>
    );
  };

  const goPrevious = async () => {
    if (await requestFullscreen()) {
      return;
    }
    if (openedPhotoIndex > 0) {
      navigate({
        pathname:
          "/photo/" +
          encodeURIComponent(props.photos[openedPhotoIndex - 1].file),
      });
    } else {
      goExit();
    }
  };

  const goNext = async () => {
    if (await requestFullscreen()) {
      return;
    }
    if (openedPhotoIndex < props.photos.length - 1) {
      navigate({
        pathname:
          "/photo/" +
          encodeURIComponent(props.photos[openedPhotoIndex + 1].file),
      });
    } else {
      goExit();
    }
  };

  const goExit = async () => {
    await exitFullscreen();
    await sleep(200);
    navigate({ pathname: "/" });
  };

  return renderPhotoFs(
    props.photos[openedPhotoIndex],
    openedPhotoIndex < props.photos.length - 1
      ? props.photos[openedPhotoIndex + 1]
      : null
  );
};
