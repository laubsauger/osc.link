import React, { useEffect, useRef } from 'react';
import ReactImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import './styles.scss'
import { Result } from '../Phases/Voting';
import { observer } from 'mobx-react-lite';
import ImageZoom from '../ImageZoom';

const VotingImageGallery = ({
  votableResults,
  initialResultInView,
  votedResult,
  onSlideChanged
}: {
  votableResults: any[]|undefined,
  votedResult: Result|null,
  initialResultInView?: Result,
  onSlideChanged: (result: any) => void
}) => {
  const ref = useRef(null)

  if (!votableResults) {
    return <div>No images</div>
  }

  return (
    <ReactImageGallery
      ref={ref}
      startIndex={initialResultInView ? votableResults.indexOf(initialResultInView) : 0}
      items={votableResults.map((image) => ({
        thumbnail: image.image,
        original: image.image,
        renderItem: () => (
          <div className="position-relative">
            <div className="position-absolute gallery-bg-img-wrap">
              <img src={image.image} alt="" className="gallery-bg-img"/>
            </div>
            <ImageZoom src={image.image} alt="gallery-img" className="position-relative shadow-sm gallery-img z-index-above" />
          </div>
        ),
        thumbnailClass: votedResult && votedResult.player_index === image.player_index ? (
          'voted-result'
        ) : '',
        thumbnailLabel: votedResult && votedResult.player_index === image.player_index ? (
            'Voted!'
          ) : '',
        thumbnailTitle:
          votedResult && votedResult.player_index === image.player_index ? (
            'Voted!'
          ) : '',
      }))}
      showFullscreenButton={false}
      showPlayButton={false}
      autoPlay={false}
      slideDuration={undefined}
      showBullets={true}
      showNav={true}
      onBeforeSlide={(currentIndex) => {
        onSlideChanged && onSlideChanged(votableResults[currentIndex])
      }}
    />
  );
};

export default observer(VotingImageGallery)