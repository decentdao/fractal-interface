import { Tree, Hat } from '@hatsprotocol/sdk-v1-subgraph';
import { Hex } from 'viem';
import { create } from 'zustand';

export class DecentHatsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecentHatsError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DecentHatsError);
    }
  }
}

interface DecentHat {
  id: Hex;
  prettyId?: string;
  name?: string;
  description?: string;
}

interface DecentTree {
  topHat: DecentHat;
  adminHat: DecentHat;
  roleHats: DecentHat[];
}

interface Roles {
  hatsTreeId: undefined | null | number;
  hatsTree: undefined | null | DecentTree;
  setHatsTreeId: (hatsTreeId: undefined | null | number) => void;
  setHatsTree: (hatsTree: undefined | null | Tree) => void;
}

const appearsExactlyNumberOfTimes = (
  str: string | undefined,
  char: string,
  count: number,
): boolean => {
  if (str === undefined) {
    return false;
  }

  let occurrences = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === char) {
      occurrences++;
    }
  }

  return occurrences === count;
};

const getRawTopHat = (hats: Hat[]) => {
  const potentialRawTopHats = hats.filter(h => appearsExactlyNumberOfTimes(h.prettyId, '.', 0));

  if (potentialRawTopHats.length === 0) {
    throw new DecentHatsError('Top Hat is missing');
  }

  if (potentialRawTopHats.length > 1) {
    throw new DecentHatsError('Too many Top Hats');
  }

  return potentialRawTopHats[0];
};

const getRawAdminHat = (hats: Hat[]) => {
  const potentialRawAdminHats = hats.filter(h => appearsExactlyNumberOfTimes(h.prettyId, '.', 1));

  if (potentialRawAdminHats.length === 0) {
    throw new DecentHatsError('Admin Hat is missing');
  }

  if (potentialRawAdminHats.length > 1) {
    throw new DecentHatsError('Too many Admin Hats');
  }

  return potentialRawAdminHats[0];
};

const sanitize = (hatsTree: undefined | null | Tree): undefined | null | DecentTree => {
  if (hatsTree === undefined || hatsTree === null) {
    return hatsTree;
  }

  if (hatsTree.hats === undefined || hatsTree.hats.length === 0) {
    throw new DecentHatsError("Hats Tree doesn't have any Hats");
  }

  const rawTopHat = getRawTopHat(hatsTree.hats);

  const topHat: DecentHat = {
    id: rawTopHat.id,
    prettyId: rawTopHat.prettyId,
    name: rawTopHat.details,
    description: rawTopHat.details,
  };

  const rawAdminHat = getRawAdminHat(hatsTree.hats);

  const adminHat: DecentHat = {
    id: rawAdminHat.id,
    prettyId: rawAdminHat.prettyId,
    name: rawAdminHat.details,
    description: rawAdminHat.details,
  };

  const rawRoleHats = hatsTree.hats.filter(h => appearsExactlyNumberOfTimes(h.prettyId, '.', 2));

  const roleHats: DecentHat[] = rawRoleHats.map(rawHat => ({
    id: rawHat.id,
    prettyId: rawHat.prettyId,
    name: rawHat.details,
    description: rawHat.details,
  }));

  const decentTree: DecentTree = {
    topHat,
    adminHat,
    roleHats,
  };

  console.log({ decentTree });

  return decentTree;
};

const useRolesState = create<Roles>()(set => ({
  hatsTreeId: undefined,
  hatsTree: undefined,
  setHatsTreeId: hatsTreeId =>
    set(state => {
      // dev
      // if you want to get some mock live data,
      // switch app to Mainnet and, comment out next line:
      // return { hatsTreeId: 21 };
      // https://app.hatsprotocol.xyz/trees/1/22
      // this has a Top Hat, Admin Hat, and some Roles Hats directly beneath Admin.
      // it has more Hats too, but our app Ignores Those.
      // Find some other Hat tree structures (through trial and error using Hats webapp)
      // which violate the constraints we've declared (in code, above), to see how
      // the app responds.
      // ex: tree 23 has no Admin
      // end dev

      // if `hatsTreeId` is null or undefined,
      // set `hatsTree` to that same value
      if (typeof hatsTreeId !== 'number') {
        state.setHatsTree(hatsTreeId);
      }
      return { hatsTreeId };
    }),
  setHatsTree: hatsTree => set(() => ({ hatsTree: sanitize(hatsTree) })),
}));

export { useRolesState };
