import { NodeType, NodeAction } from '../constants/enums';

export interface FractalNode {
  nodeType?: NodeType;
  isLoaded?: boolean;
}

export type NodeActions =
  | { type: NodeAction.SET_NODE_TYPE; payload: NodeType }
  | { type: NodeAction.INVALIDATE }
  | { type: NodeAction.RESET };
