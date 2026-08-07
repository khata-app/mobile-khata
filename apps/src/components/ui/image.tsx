/* eslint-disable react-refresh/only-export-components */
import type { ImageProps } from 'expo-image';
import { Image as NImage } from 'expo-image';
import * as React from 'react';

export type ImgProps = ImageProps & {
  className?: string;
};

export function Image({
  style,
  className,
  placeholder = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
  ...props
}: ImgProps) {
  return (
    <NImage
      className={className}
      placeholder={placeholder}
      style={style}
      {...props}
    />
  );
}

export function preloadImages(sources: string[]) {
  NImage.prefetch(sources);
}
