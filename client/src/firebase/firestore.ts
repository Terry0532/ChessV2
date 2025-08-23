import {
  collection,
  doc,
  getDoc,
  getDocs,
  or,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "./config";

export interface UserPlayHistory {
  played: number;
  won: number;
  draw: number;
  lost: number;
}

export interface ArchivedGame {
  id: string;
  blackPlayer: string;
  whitePlayer: string;
  finishedAt: Timestamp;
  moves: string[];
  result: string;
  startedAt: number;
}

export const getUserPlayHistory = async (uid: string): Promise<UserPlayHistory> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        played: userData.played || 0,
        won: userData.won || 0,
        draw: userData.draw || 0,
        lost: userData.lost || 0,
      };
    } else {
      return {
        played: 0,
        won: 0,
        draw: 0,
        lost: 0,
      };
    }
  } catch (error) {
    console.error("Error fetching user play history:", error);
    return {
      played: 0,
      won: 0,
      draw: 0,
      lost: 0,
    };
  }
};

export const getUserGameHistory = async (uid: string) => {
  try {
    const q = query(
      collection(db, "archivedGames"),
      or(where("blackPlayer", "==", uid), where("whitePlayer", "==", uid))
    );
    const querySnapshot = await getDocs(q);
    const games: ArchivedGame[] = [];

    querySnapshot.forEach((doc) => {
      games.push({
        id: doc.id,
        ...doc.data(),
      } as ArchivedGame);
    });

    return games;
  } catch (error) {
    console.error("Error fetching user game history:", error);
    return [];
  }
};

export const getBatchUserPlayHistory = async (
  uids: string[]
): Promise<Record<string, UserPlayHistory>> => {
  try {
    const promises = uids.map((uid) => getUserPlayHistory(uid));
    const results = await Promise.all(promises);

    const playHistoryMap: Record<string, UserPlayHistory> = {};
    uids.forEach((uid, index) => {
      playHistoryMap[uid] = results[index];
    });

    return playHistoryMap;
  } catch (error) {
    console.error("Error fetching batch user play history:", error);
    return {};
  }
};
