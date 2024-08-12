import React, { MouseEventHandler, TouchEventHandler, useCallback, useEffect, useRef, useState } from 'react'
import useCanvas from "../../hooks/useCanvas";
import {useStores} from "../../hooks/useStores";
import {observer} from "mobx-react-lite";

type Props = {
  draw: Function,
  options: { context: any },
  setRef?: any,
  onTouchStart?: TouchEventHandler,
  onTouchMove?: TouchEventHandler,
  onTouchEnd?: TouchEventHandler,
  onMouseDown: MouseEventHandler,
  onMouseMove: MouseEventHandler,
  onMouseUp?: MouseEventHandler,
}

const Canvas = (props:Props) => {
  const { draw, options, setRef, onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchEnd, ...rest } = props;
  const { context } = options;
  const canvasRef = useCanvas(draw, { context });
  const [key, setKey] = useState(0);

  const touchStartListener = useCallback((e:any) => {
    if (e.target === canvasRef.current) {
      e.preventDefault();
      if (onTouchStart) {
        onTouchStart(e);
      }
    }
  }, [onTouchStart]);

  const touchMoveListener = useCallback((e:any) => {
    e.preventDefault();
    if (e.target === canvasRef.current) {
      if (onTouchMove) {
        onTouchMove(e);
      }
    }
  }, [ onTouchMove ]);

  const touchEndListener = useCallback((e:any) => {
    if (e.target === canvasRef.current) {
      e.preventDefault();
      if (onTouchEnd) {
        onTouchEnd(e);
      }
    }
  }, [ onTouchEnd ]);


  const mouseDownListener = useCallback((e:any) => {
    if (e.target === canvasRef.current) {
      if (onMouseDown) {
        onMouseDown(e);
      }
    }
  }, [onMouseDown]);

  const mouseMoveListener = useCallback((e:any) => {
    if (e.target === canvasRef.current) {
      if (onMouseMove) {
        onMouseMove(e);
      }
    }
  }, [onMouseMove]);

  const mouseUpListener = useCallback((e:any) => {
    if (e.target === canvasRef.current) {
      if (onMouseUp) {
        onMouseUp(e);
      }
    }
  }, [onMouseUp]);

  useEffect(() => {
    const handleResize = () => {
      // Trigger a re-render
      setKey(prevKey => prevKey + 1);
    };

    if (setRef) {
      setRef(canvasRef);
      if (canvasRef && canvasRef.current) {
        canvasRef.current.addEventListener('touchstart', touchStartListener, { passive: false })
        canvasRef.current.addEventListener('touchmove', touchMoveListener, { passive: false })
        canvasRef.current.addEventListener('touchend', touchEndListener, { passive: false })
        canvasRef.current.addEventListener('mousedown', mouseDownListener);
        canvasRef.current.addEventListener('mousemove', mouseMoveListener, { passive: false });
        canvasRef.current.addEventListener('mouseup', mouseUpListener);
        window.addEventListener('resize', handleResize);
      }
    }
    return () => {
      canvasRef?.current?.removeEventListener('touchstart', touchStartListener);
      canvasRef?.current?.removeEventListener('touchmove', touchMoveListener);
      canvasRef?.current?.removeEventListener('touchend', touchEndListener);
      canvasRef?.current?.removeEventListener('mousedown', mouseDownListener);
      canvasRef?.current?.removeEventListener('mousemove', mouseMoveListener);
      canvasRef?.current?.removeEventListener('mouseup', mouseUpListener);
      window.removeEventListener('resize', handleResize);
    }
  }, [ setRef, canvasRef, onTouchMove, mouseDownListener, mouseMoveListener, mouseUpListener ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    // Resize canvas and possibly other operations every time the component re-renders
    if (canvas) {
      // Resize the canvas
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
  }, [canvasRef]);

  return (
    <canvas
      key={key}
      className="border-bottom border-top border-secondary"
      style={{ width: '100%' }}
      ref={canvasRef}
      {...rest}
    />
  )
}
export default observer(Canvas);