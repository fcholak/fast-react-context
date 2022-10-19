import {
  useState,
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";

export default function createFastContext<Store>(initialState: Store) {
  function useStoreData(): {
    get: () => Store;
    // Define Partial Store, when you set you can use just parts of the store
    set: (value: Partial<Store>) => void;
    // You give a callback, and it returns an unsubscribe function
    subscribe: (callback: () => void) => () => void;
  } {
    const store = useRef(initialState);

    // custom hook -> should be wrapped in callback
    // why?? anytime is rerun it will return a new reference
    // cache getter fn between re-renders
    const get = useCallback(() => store.current, []);

    // subscriber list
    // we can use array as argument, but when we subscribe with the same function
    // we gonna get multiple instances in the array that we need to delete ...
    // so we use Set to add the same value only once, when we have
    const subscribers = useRef(new Set<() => void>());

    const set = useCallback((value: Partial<Store>) => {
      store.current = { ...store.current, ...value };
      subscribers.current.forEach((callback) => callback());
    }, []);

    const subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback);

      // cleanup (unsubscribe method)
      return () => subscribers.current.delete(callback);
    }, []);

    return {
      get,
      set,
      subscribe,
    };
  }

  // Utility type
  type UseStoreDataReturnType = ReturnType<typeof useStoreData>;

  const StoreContext = createContext<UseStoreDataReturnType | null>(null);

  // Provider
  function Provider({ children }: { children: React.ReactNode }) {
    return (
      <StoreContext.Provider value={useStoreData()}>
        {children}
      </StoreContext.Provider>
    );
  }

  function useStore<SelectorOutput>(
    selector: (store: Store) => SelectorOutput
  ): [SelectorOutput, (value: Partial<Store>) => void] {
    const store = useContext(StoreContext);

    if (!store) {
      throw new Error("Store not found!");
    }

    // const [state, setState] = useState(store.get());

    // useEffect(() => {
    //   return store.subscribe(() => setState(store.get()));
    // }, []);

    // when the subscribed data source changes it snapshots the change
    // and store it locally
    const state = useSyncExternalStore(store.subscribe, () =>
      selector(store.get())
    );

    return [state, store.set];
  }

  return {
    Provider,
    useStore,
  };
}
