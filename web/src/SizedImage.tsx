type Props = {
  src: string;
  width: number | null;
  height: number | null;
  className: string;
};

export const SizedImage = (props: Props) => {
  if (props.width && props.height) {
    return (
      <svg
        viewBox={`0 0 ${props.width} ${props.height}`}
        className={props.className}
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
  } else {
    return <img className={props.className} src={props.src} alt="" />;
  }
};
