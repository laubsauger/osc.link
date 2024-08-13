import React, { useEffect, useRef, useState } from 'react';
import ReactImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import './styles.scss'
import { Result } from '../Phases/Voting';
import { observer } from 'mobx-react-lite';
import ImageZoom from '../ImageZoom';

const ResultsImageGallery = ({
  results,
  onSlideChanged
}: {
  results: Result[]|undefined,
  onSlideChanged: (result: any) => void
}) => {
  const ref = useRef(null)
  const [ sortedResults, setSortedResults ] = useState<Result[]>()

  useEffect(() => {
    if (results) {
      const tempResults = [...results];
      tempResults.sort((a, b) => (b.votes || 0) - (a.votes || 0));
      setSortedResults(tempResults);
    }
  }, [results]);

  useEffect(() => {
    onSlideChanged(sortedResults ? sortedResults[0] : 0)
  }, [sortedResults, onSlideChanged]);

  if (!sortedResults) {
    return <div>No images</div>
  }

  return (
    <ReactImageGallery
      ref={ref}
      startIndex={0}
      items={sortedResults.map((image, index) => ({
        thumbnail: image.image,
        original: image.image,
        thumbnailClass: index === 0 ? (
            'voted-result'
          ) : '',
        // renderItem: () => (
        //   <img src={image.image} alt="" />
        // ),
        renderItem: () => (
          <div className="position-relative">
            <div className="position-absolute gallery-bg-img-wrap">
              <img src={image.image} alt="" className="gallery-bg-img"/>
            </div>
            <ImageZoom src={image.image} alt="gallery-img" className="position-relative shadow-sm gallery-img z-index-above" />
          </div>
        ),
        renderThumbInner: () => (
          <div className="image-gallery-thumbnail-inner position-relative h-100">
             <img src={image.image} alt="" className="image-gallery-thumbnail-image" />
            <div className="position-absolute top-0 z-index-above w-100 h-100">
              <div className="image-gallery-thumbnail-label bg-black position-relative align-self-end" style={{ opacity: '85%', top: '8px' }}>
                <span>Votes:{' '}</span><span className="fw-semibold">{image.votes}</span>
              </div>
              {index === 0 && (
                <div className="image-gallery-thumbnail-label" style={{ position: 'absolute', top: 'initial', bottom: '-9px' }}>Winner!</div>
              )}
            </div>
          </div>
        )
      }))}
      showFullscreenButton={false}
      showPlayButton={false}
      autoPlay={false}
      slideDuration={undefined}
      showBullets={true}
      showNav={true}
      onBeforeSlide={(currentIndex) => {
        onSlideChanged && onSlideChanged(sortedResults[currentIndex])
      }}
    />
  );
};

export default observer(ResultsImageGallery);