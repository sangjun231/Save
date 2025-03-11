declare module 'react-rating-stars-component' {
  interface ReactStarsProps {
    count?: number;
    value?: number;
    onChange?: (newRating: number) => void;
    size?: number;
    isHalf?: boolean;
    emptyIcon?: JSX.Element;
    halfIcon?: JSX.Element;
    filledIcon?: JSX.Element;
    edit?: boolean;
    color?: string;
    activeColor?: string;
  }

  const ReactStars: React.FC<ReactStarsProps>;

  export default ReactStars;
}
