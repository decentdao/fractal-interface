import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { create } from 'zustand';

interface Roles {
  hatsTreeId: undefined | null | number;
  hatsTree: undefined | null | Tree;
  setHatsTreeId: (hatsTreeId: undefined | null | number) => void;
  setHatsTree: (hatsTree: undefined | null | Tree) => void;
}

const useRolesState = create<Roles>()(set => ({
  hatsTreeId: undefined,
  hatsTree: undefined,
  setHatsTreeId: hatsTreeId =>
    set(state => {
      // if `hatsTreeId` is null or undefined,
      // set `hatsTree` to that same value
      if (typeof hatsTreeId !== 'number') {
        state.setHatsTree(hatsTreeId);
      }
      return { hatsTreeId };
    }),
  setHatsTree: hatsTree => set(() => ({ hatsTree })),
}));

export { useRolesState };
