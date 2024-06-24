import { FractalNode, NodeHierarchy } from '../../../types';
import { NodeAction, NodeActions } from './action';

export const initialNodeHierarchyState: NodeHierarchy = {
  parentAddress: null,
  childNodes: [],
};

export const initialNodeState: FractalNode = {
  daoName: null,
  daoAddress: null,
  safe: null,
  fractalModules: [],
  nodeHierarchy: initialNodeHierarchyState,
  isHierarchyLoaded: false,
  isModulesLoaded: false,
};

export function nodeReducer(state: FractalNode, action: NodeActions) {
  switch (action.type) {
    case NodeAction.SET_SAFE_INFO: {
      return {
        ...state,
        safe: action.payload,
        daoAddress: action.payload.address,
      };
    }
    case NodeAction.SET_DAO_INFO: {
      return { ...state, ...action.payload, isHierarchyLoaded: true };
    }
    case NodeAction.SET_FRACTAL_MODULES: {
      return { ...state, fractalModules: action.payload, isModulesLoaded: true };
    }
    case NodeAction.UPDATE_DAO_NAME: {
      return { ...state, daoName: action.payload };
    }
    default:
      return state;
  }
}
