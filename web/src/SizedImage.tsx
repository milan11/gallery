import { useState } from "react";

type Props = {
  src: string;
  width: number;
  height: number;
  lazy: boolean;
  className: string;
  onLoad?: (() => void) | undefined;
};

export const SizedImage = (props: Props) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {!isLoaded && (
        <svg
          viewBox={`0 0 ${props.width} ${props.height}`}
          className={props.className}
          style={{
            maxWidth: `min(${props.width}px, 100%)`,
            maxHeight: `min(${props.height}px, 100%)`,
          }}
        ></svg>
      )}
      <img
        loading={props.lazy ? "lazy" : undefined}
        className={props.className}
        alt=""
        src={props.src}
        style={{
          maxWidth: `min(${props.width}px, 100%)`,
          maxHeight: `min(${props.height}px, 100%)`,
          width: !isLoaded ? 0 : "auto",
          height: !isLoaded ? 0 : "auto",
        }}
        onLoad={() => {
          setIsLoaded(true);
          if (props.onLoad !== undefined) {
            props.onLoad();
          }
        }}
      />
    </>
  );
};
