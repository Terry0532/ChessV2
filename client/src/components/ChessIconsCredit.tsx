import React from "react";
import "../index.css";
import { Theme } from "../helpers/types";

type ChessIconsCreditProps = {
  theme: Theme;
};

const ChessIconsCredit: React.FC<ChessIconsCreditProps> = ({ theme }) => {
  return (
    <div className="icons-attribution">
      <div>
        {" "}
        <small className={theme}>
          {" "}
          Chess Icons And Favicon (extracted) By en:User:Cburnett [
          <a href="http://www.gnu.org/copyleft/fdl.html">GFDL</a>,{" "}
          <a href="http://creativecommons.org/licenses/by-sa/3.0/">
            CC-BY-SA-3.0
          </a>
          ,{" "}
          <a href="http://opensource.org/licenses/bsd-license.php">
            BSD
          </a>{" "}
          or <a href="http://www.gnu.org/licenses/gpl.html">GPL</a>],{" "}
          <a href="https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces">
            via Wikimedia Commons
          </a>{" "}
        </small>
      </div>
    </div>
  );  
}

export default ChessIconsCredit;
