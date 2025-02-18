import React from "react";
import "../index.css";

type FallenSoldierBlockProps = {
  whiteFallenSoldiers: any[];
  blackFallenSoldiers: any[];
};

const FallenSoldierBlock: React.FC<FallenSoldierBlockProps> = ({ 
  whiteFallenSoldiers, blackFallenSoldiers 
}) => {
  const renderSquare = ({ style: { backgroundImage } }, index) => (
    <button
      key={index}
      className="square"
      style={{ backgroundImage, borderColor: "transparent" }}
    />
  );
  
  return (
    <div>
      {[whiteFallenSoldiers, blackFallenSoldiers].map((soldiers, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {soldiers.map(renderSquare)}
        </div>
      ))}
    </div>
  );  
}

export default FallenSoldierBlock;
