import React from "react";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { observer } from 'mobx-react-lite';

type ImageProps = React.HTMLProps<HTMLImageElement>;

const ImageZoom: React.FC<ImageProps> = ({ ...rest }) => {
  return (
    <div className="d-flex justify-content-center align-items-center h-100">
      <TransformWrapper>
        <div className="d-flex justify-content-center align-items-center w-100 h-100">
          <TransformComponent>
            <img alt="" {...rest} />
          </TransformComponent>
        </div>
      </TransformWrapper>
    </div>
  );
}
export default observer(ImageZoom)