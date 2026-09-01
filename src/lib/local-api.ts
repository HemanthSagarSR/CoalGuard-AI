import { useEffect, useState } from "react";
import { mutateData, queryData, subscribeLocal } from "./local-db";

export const api: any = new Proxy({}, {
  get(_target, prop: string) {
    return new Proxy({}, {
      get(_nested, method: string) {
        return { __localOperation: true, name: `${prop}.${method}` };
      },
    });
  },
});

export function useQuery(operation: any, args?: any) {
  const [version, setVersion] = useState(0);
  useEffect(() => subscribeLocal(() => setVersion(v => v + 1)), []);
  void version;
  if (args === "skip") return undefined;
  return queryData(operation?.name, args);
}

export function useMutation(operation: any) {
  return async (args?: any) => mutateData(operation?.name, args);
}

export function useAction(operation: any) {
  return async (args?: any) => {
    if (operation?.name === "chat.askAssistant") {
      const answer = queryData("chat.localAnswer", args);
      return answer || "I couldn't generate an answer.";
    }
    return mutateData(operation?.name, args);
  };
}
