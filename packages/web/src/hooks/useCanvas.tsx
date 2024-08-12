import { useRef, useEffect, useState } from 'react'

function resizeCanvasToDisplaySize(canvas:HTMLCanvasElement) {
  const { width, height } = canvas.getBoundingClientRect();

  if (canvas.width !== width || canvas.height !== height) {
    const { devicePixelRatio:ratio = 1 } = window;
    const context:CanvasRenderingContext2D|null = canvas.getContext('2d');

    if (!context) {
      return false;
    }

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.scale(ratio, ratio);

    return true;
  }

  return false;
}

const useCanvas = (draw:Function, options:{ context:any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [ canvas, setCanvas ] = useState<HTMLCanvasElement|false>(false);

  useEffect(() => {
    if (!canvas) {
      return;
    }

    let timeoutId:any = null;
    const resizeListener = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => resizeCanvasToDisplaySize(canvas), 100);
    };
    resizeCanvasToDisplaySize(canvas);

    window.addEventListener('resize', resizeListener);

    return () => {
      window.removeEventListener('resize', resizeListener);
    }
  }, [ canvas ])

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext(options.context || '2d');

    if (!context) {
      return;
    }

    context.lineWidth = 1;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    // context.globalCompositeOperation = 'destination-atop';

    let frameCount = 0;
    let animationFrameId = 0;

    const render = () => {
      frameCount++;

      if (context) {
        draw(context, frameCount);
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    setCanvas(canvas);

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    }
  }, [ draw ]);

  return canvasRef;
}
export default useCanvas;