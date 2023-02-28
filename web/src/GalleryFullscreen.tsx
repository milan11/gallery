import { useEffect, useState } from "react";
import Swipe from "react-easy-swipe";
import { GlobalHotKeys } from "react-hotkeys";
import { useNavigate, useParams } from "react-router-dom";
import { Photo } from "./Data";
import { exitFullscreen, requestFullscreen } from "./Fullscreen";
import { SizedImage } from "./SizedImage";
import { sleep } from "./Utils";

const rememberedCountBefore = 2;
const preloadedCountAfter = 3;

type Props = {
  photos: Photo[];
};

const keyMap = {
  PREVIOUS: ["left", "up"],
  NEXT: ["right", "down", "space", "enter"],
  EXIT: ["esc"],
};

export const GalleryFullscreen = (props: Props) => {
  const { gallery } = useParams();
  const navigate = useNavigate();

  const { file } = useParams();

  const [loadedPhotos, setLoadedPhotos] = useState<number[]>([]);

  const openedPhotoIndex = props.photos.findIndex(
    (photo) => photo.file === file
  );

  useEffect(() => {
    if (openedPhotoIndex !== -1) {
      const newLoadedPhotos = loadedPhotos.filter(
        (index) =>
          index >= openedPhotoIndex - rememberedCountBefore &&
          index <= openedPhotoIndex + preloadedCountAfter
      );
      if (newLoadedPhotos.length !== loadedPhotos.length) {
        setLoadedPhotos(newLoadedPhotos);
      }
    }
  }, [loadedPhotos, openedPhotoIndex]);

  if (openedPhotoIndex === -1) {
    return null;
  }

  const goPrevious = async () => {
    if (await requestFullscreen()) {
      return;
    }
    if (openedPhotoIndex > 0) {
      navigate({
        pathname:
          "/gallery/" +
          encodeURIComponent(gallery!) +
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
          "/gallery/" +
          encodeURIComponent(gallery!) +
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
    navigate({ pathname: "/gallery/" + encodeURIComponent(gallery!) });
  };

  const handlers = {
    PREVIOUS: () => goPrevious(),
    NEXT: () => goNext(),
    EXIT: () => goExit(),
  };

  let images = [];

  for (
    let i = openedPhotoIndex - rememberedCountBefore;
    i <= openedPhotoIndex + preloadedCountAfter;
    ++i
  ) {
    const index = i;

    if (index < 0 || index >= props.photos.length) {
      continue;
    }

    const photo = props.photos[index];

    const remember = index < openedPhotoIndex;
    const show = index === openedPhotoIndex;
    const preload = index > openedPhotoIndex;

    if (remember && loadedPhotos.indexOf(index) === -1) {
      continue;
    }

    images.push(
      <SizedImage
        key={index}
        src={
          process.env.PUBLIC_URL +
          "/data/" +
          encodeURIComponent(gallery!) +
          "/l_" +
          encodeURIComponent(photo.file)
        }
        width={photo.l_width}
        height={photo.l_height}
        className={show ? "galleryImageFs" : "galleryImageFsHidden"}
        onLoad={() => {
          if (loadedPhotos.indexOf(index) === -1) {
            const newLoadedPhotos = [...loadedPhotos, index];
            setLoadedPhotos(newLoadedPhotos);
          }
        }}
      />
    );

    if ((show || preload) && loadedPhotos.indexOf(index) === -1) {
      break;
    }
  }

  return (
    <Swipe
      tolerance={40}
      onSwipeRight={goPrevious}
      onSwipeLeft={goNext}
      onSwipeUp={goExit}
    >
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

        <div className="galleryPhotoFs">{images}</div>

        {props.photos[openedPhotoIndex].description ? (
          <div className="galleryDescriptionFs">
            {props.photos[openedPhotoIndex].description}
          </div>
        ) : (
          <div className="galleryDescriptionFsNone">
            {props.photos[openedPhotoIndex].description}
          </div>
        )}
      </div>
    </Swipe>
  );
};
