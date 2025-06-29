import React from "react";
import { motion } from "framer-motion";

interface AnimatedPieceProps {
  piece: any;
  fromPosition: number;
  toPosition: number;
  onAnimationComplete: () => void;
  boardSize: number;
  squareSize: number;
}

const AnimatedPiece: React.FC<AnimatedPieceProps> = ({
  piece,
  fromPosition,
  toPosition,
  onAnimationComplete,
  boardSize = 8,
  squareSize = 48,
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
        top: 14,
        left: 15,
      }}
      initial={{
        x: fromCoords.x,
        y: fromCoords.y,
      }}
      animate={{
        x: toCoords.x,
        y: toCoords.y,
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
