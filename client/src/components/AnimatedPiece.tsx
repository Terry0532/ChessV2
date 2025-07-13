import React from "react";
import { motion } from "framer-motion";

interface AnimatedPieceProps {
  piece: any;
  fromPosition: number;
  toPosition: number;
  onAnimationComplete: () => void;
  boardSize: number;
  squareSize: number;
  isRotated?: boolean;
}

const AnimatedPiece: React.FC<AnimatedPieceProps> = ({
  piece,
  fromPosition,
  toPosition,
  onAnimationComplete,
  boardSize = 8,
  squareSize = 48,
  isRotated = false,
}) => {
  const getCoordinates = (position: number) => {
    const row = Math.floor(position / boardSize);
    const col = position % boardSize;
    return {
      x: col * squareSize,
      y: row * squareSize,
    };
  };

  const fromCoords = getCoordinates(fromPosition);
  const toCoords = getCoordinates(toPosition);

  const labelOffset = {
    x: isRotated ? 0 : 20,
    y: isRotated ? 0 : 20,
  };

  return (
    <motion.div
      className="animated-piece"
      style={{
        position: "fixed",
        width: squareSize,
        height: squareSize,
        backgroundImage: piece.style.backgroundImage,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        zIndex: 9999,
        pointerEvents: "none",
        top: 14 + labelOffset.y,
        left: 15 + labelOffset.x,
      }}
      initial={{
        x: fromCoords.x,
        y: fromCoords.y,
        rotate: isRotated ? 180 : 0,
      }}
      animate={{
        x: toCoords.x,
        y: toCoords.y,
        rotate: isRotated ? 180 : 0,
      }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
      onAnimationComplete={onAnimationComplete}
    />
  );
};

export default AnimatedPiece;
