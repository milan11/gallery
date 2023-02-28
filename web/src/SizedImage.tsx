type Props = {
  src: string;
  width: number;
  height: number;
  className: string;
  onLoad?: (() => void) | undefined;
};

export const SizedImage = (props: Props) => {
  return (
    <svg
      viewBox={`0 0 ${props.width} ${props.height}`}
      className={props.className}
      style={{
        maxWidth: `min(${props.width}px, 100%)`,
        maxHeight: `min(${props.height}px, 100%)`,
      }}
      onLoad={props.onLoad}
    >
      <image
        x={0}
        y={0}
        width={props.width}
        height={props.height}
        href={props.src}
      ></image>
    </svg>
  );
};
