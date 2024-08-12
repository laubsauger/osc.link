import React, { useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import './styles.scss';
import Canvas from "../../Canvas";
import {useSocket} from "../../../hooks/useSocket";

type Props = {
  channelNames: {
    x: string,
    y: string
  },
  released: boolean,
  feedback?: boolean
}

type NormalizedPosition = {
  x:number, y:number, normalized_x:number, normalized_y:number
}

function normalizePosition(x:number, y:number, width:number, height:number): NormalizedPosition {
  const { devicePixelRatio:ratio = 1 } = window;

  const normalized_x = (x / width) * ratio;
  const normalized_y = (y / height) * ratio;

  return {
    x,
    y,
    normalized_x: normalized_x < 0 ? 0 : (normalized_x > 1 ? 1 : normalized_x),
    normalized_y: normalized_y < 0 ? 0 : (normalized_y > 1 ? 1 : normalized_y),
  }
}

function getMousePosition(ev:MouseEvent|Touch, ref:any) {
  const x = ev.pageX - ref.current.offsetLeft;
  const y = ev.pageY - ref.current.offsetTop;

  return normalizePosition(x, y, ref.current.width, ref.current.height);
}

function getTouchPosition(ev:TouchEvent, ref:any) {
  const firstTouch = ev.touches[0];

  console.log('firstTouch', firstTouch);
  console.log('ref.current', ref.current);
  console.log('pageX', firstTouch.pageX);
  console.log('pageY', firstTouch.pageY);
  console.log('canvas offsetLeft', ref.current.offsetLeft);
  console.log('canvas offsetTop', ref.current.offsetTop);
  console.log('canvas width', ref.current.width);
  console.log('canvas height', ref.current.height);

  const x = firstTouch.pageX - ref.current.offsetLeft;
  const y = firstTouch.pageY - ref.current.offsetTop;

  return normalizePosition(x, y, ref.current.width, ref.current.height);
}

const drawCrossHair = (ctx:CanvasRenderingContext2D, canvasWidth:number, canvasHeight:number, pos:any, alpha:number) => {
  ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
  // paint crosshair
  ctx.beginPath();
  ctx.moveTo(0, pos.y);
  ctx.lineTo(canvasWidth, pos.y);
  ctx.moveTo(pos.x, 0);
  ctx.lineTo(pos.x, canvasHeight);
  ctx.stroke();
  ctx.closePath();
}

const CtrlXY = (props:Props) => {
  const { channelNames, released, feedback } = props;
  const socket = useSocket();
  const positionsToDraw = useRef<{ x: number }[]>([]);
  const [ isPainting, setIsPainting ] = useState(false);
  const [ pos, setPos ] = useState<any>({ x: 0.5, y: 0.5, normalized_x: 0.5, normalized_y: 0.5 });
  const [ ref, setRef ] = useState<any>({});

  const draw = useCallback((ctx:any) => {
    if (isPainting && pos && ref.current) {
      // console.log('is drawing');
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // if (feedback) {
      //   drawTrails(ctx)
      // }
      drawCrossHair(ctx, ref.current.width, ref.current.height, pos, 0.7);
    }
  }, [ isPainting, pos, ref]);

  const [cursorPositions, setCursorPositions] = useState<Array<{x: number, y: number, life: number}>>([]);
  const [trailIsActive, setTrailIsActive] = useState<boolean>(true);

  const drawTrails = useCallback((context: CanvasRenderingContext2D) => {
    cursorPositions.forEach((position, index) => {
      const alpha = position.life / 500;

      context.beginPath();
      context.arc(position.x, position.y, 10, 0, Math.PI * 2, false);
      context.closePath();
      context.fillStyle = `rgba(64,64,255,${alpha})`;
      context.fill();

        position.life -= 1;

        if (position.life === 0) {
          cursorPositions.splice(index, 1);
        }
    });

    setCursorPositions(cursorPositions);
  }, [cursorPositions, trailIsActive]);

  const trailMouseMove = useCallback((e:any) => {
    setCursorPositions(cursorPositions.concat([{x: pos.x, y: pos.y, life: 500}]));
  }, [cursorPositions, pos]);

  const emitPaintMessage = useCallback((mousePos: { normalized_x: number, normalized_y: number }) => {
    const posObj:any = {};
    posObj[channelNames.x] = mousePos.normalized_x;
    posObj[channelNames.y] = mousePos.normalized_y;

    socket.emit('OSC_CTRL_MESSAGE', {
      message: 'paint',
      ...posObj,
    });
  }, [ socket, channelNames.x, channelNames.y ]);

  const emitMouseDownStateMessage = useCallback((state: any) => {
    socket.emit('OSC_CTRL_MESSAGE', {
      message: 'mouseDown',
      state,
    });
  }, [ socket ]);

  const handleDragStart = useCallback((ev:any) => {
    if (!ref || ev.target !== ref.current) {
      console.log('no ref or ref current is not target, dont draw');
      return
    }

    emitMouseDownStateMessage(1);

    console.log('painting...');
    setIsPainting(true);
    const mousePos = ev.type === 'touchstart' ? getTouchPosition(ev, ref) : getMousePosition(ev, ref);

    if (pos === mousePos) {
      console.log('equal old and new pos, dont redraw');
    } else {
      setPos(mousePos);
      emitPaintMessage(mousePos);
      positionsToDraw.current.push(mousePos);
    }
  }, [ref, pos, emitPaintMessage, emitMouseDownStateMessage]);

  const handlePaint = useCallback((ev:any) => {
    if (!isPainting) {
      return;
    }

    const mousePos = ev.type === 'touchmove' ? getTouchPosition(ev, ref) : getMousePosition(ev, ref);
    setPos(mousePos);
    emitPaintMessage(mousePos);
    positionsToDraw.current.push(mousePos);
  }, [ ref, isPainting, emitPaintMessage ]);

  // const throttledHandlePaint = (ev:any) => {
  //   if (!isPainting) {
  //     return;
  //   }
  //
  //   const mousePos = ev.type === 'touchmove' ? getTouchPosition(ev, ref) : getMousePosition(ev, ref);
  //   setPos(mousePos);
  //   emitPaintMessage(mousePos);
  //
  //   if (!ref.current) {
  //     //@ts-ignore
  //     canvasRef.current = setTimeout(() => {
  //       // if (ev.target === canvasRef.current) {
  //         if (onTouchMove) {
  //           onTouchMove(ev);
  //         }
  //       // }
  //       //@ts-ignore
  //       clearTimeout(ref.current);
  //       ref.current = null;
  //     }, 500)
  //   }
  // }

  useEffect(() => {
    if (released) {
      console.log('painting stop');
      emitMouseDownStateMessage(0);
      setIsPainting(false);
    }
  }, [ released, emitMouseDownStateMessage ]);

  return (
    <div className={`CtrlXY d-flex mt-2 ${isPainting ? 'no-cursor' : ''}`} style={{ flex: 1 }}>
      {/*<div className="position-absolute w-100 d-flex flex-column align-items-end font-monospace top-0 " >*/}
      {/*  <div style={{ marginRight: '10px' }}>x (normalized): { pos.normalized_x.toFixed(2) }</div>*/}
      {/*  <div style={{ marginRight: '10px' }}>y (normalized): { pos.normalized_y.toFixed(2) }</div>*/}
      {/*  <div style={{ marginRight: '10px' }} className="d-flex"><div>x (screen):</div> <div style={{ width: '78px', textAlign: 'end' }}>{ pos.x }</div></div>*/}
      {/*  <div style={{ marginRight: '10px' }} className="d-flex"><div>y (screen):</div><div style={{ width: '78px', textAlign: 'end' }}>{pos.y}</div></div>*/}
      {/*</div>*/}
      <Canvas
        draw={draw}
        options={{ context: '2d' }}
        setRef={setRef}
        onMouseDown={handleDragStart}
        onMouseMove={(ev) => {
          trailMouseMove(ev)
          handlePaint(ev)
        }}
        onTouchStart={handleDragStart}
        onTouchMove={(ev) => {
          trailMouseMove(ev)
          handlePaint(ev)
        }}
      />
    </div>
  )
};

export default observer(CtrlXY);