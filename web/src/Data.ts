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
