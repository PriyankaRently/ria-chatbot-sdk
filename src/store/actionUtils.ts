/**
 * Redux action utility functions for the SDK.
 * Equivalent to rootaction.ts from the host app.
 */

export interface RootActionReturnPropTypes {
  type: string;
  payload: any;
}

export const action = (type: string, payload?: any): RootActionReturnPropTypes => {
  return { type, payload };
};

export const getActionType = (actionCreator: any): string => {
  return actionCreator().type;
};
