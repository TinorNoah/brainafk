import React, { useEffect, RefObject } from 'react';

interface CanvasProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  isExpanded: boolean;
}

const Canvas: React.FC<CanvasProps> = ({ canvasRef, isExpanded }) => {
  // Handle canvas resizing
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      
      if (container) {
        // Set canvas dimensions to match container
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    
    // Initial resize and setup listener
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [canvasRef, isExpanded]);
  
  return (
    <canvas 
      ref={canvasRef}
      className="bg-white max-w-full max-h-full"
    />
  );
};

export default Canvas;
