import { doc, getDoc } from "firebase/firestore";
import { db } from "./config";

export interface UserPlayHistory {
  played: number;
  won: number;
  draw: number;
  lost: number;
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
