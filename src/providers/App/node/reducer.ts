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
};

export function nodeReducer(state: FractalNode, action: NodeActions) {
  switch (action.type) {
    case NodeAction.SET_SAFE_INFO: {
      return { ...state, safe: action.payload };
    }
    case NodeAction.SET_DAO_INFO: {
      return { ...state, ...action.payload };
    }
    case NodeAction.SET_FRACTAL_MODULES: {
      return { ...state, fractalModules: action.payload };
    }
    case NodeAction.UPDATE_DAO_NAME: {
      return { ...state, daoName: action.payload };
    }
    case NodeAction.RESET:
      return { ...initialNodeState };
    default:
      return state;
  }
}