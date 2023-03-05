export type GalleriesData = {
  galleries: {
    path: string;
    label: string;
  }[];
};

export type GalleryData = {
  title: string;
  photos: Photo[];
};

export type Photo = {
  file: string;
  description: string;
  l_width: number;
  l_height: number;
  s_width: number;
  s_height: number;
};

export function isPortrait(photo: Photo) {
  return photo.l_height > photo.l_width;
}

export function dimensionsSortIndex(photo: Photo) {
  return isPortrait(photo) ? 2 : 1;
}
