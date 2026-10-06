import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "./api";

type State<T> =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "ok"; data: T; error?: undefined }
  | { status: "error"; data?: undefined; error: ApiError };

/** Minimal fetch-on-mount with reload and setter. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<State<T>>({ status: "loading" });
  const seq = useRef(0);

  const run = useCallback(() => {
    const id = ++seq.current;
    setState((s) => (s.status === "ok" ? s : { status: "loading" }));
    fn().then(
      (data) => id === seq.current && setState({ status: "ok", data }),
      (e: unknown) =>
        id === seq.current &&
        setState({ status: "error", error: e instanceof ApiError ? e : new ApiError(String(e), 0) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  const set = useCallback((updater: (d: T) => T) => {
    setState((s) => (s.status === "ok" ? { status: "ok", data: updater(s.data) } : s));
  }, []);

  return { ...state, reload: run, set };
}
