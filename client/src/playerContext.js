import { createContext,useContext } from 'react';

export const PlayerContext = createContext({player : null});

export const usePlayer = () => useContext(PlayerContext);
