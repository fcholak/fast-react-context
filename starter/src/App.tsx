import { useState } from "react";

import createFastContext from "./createFastContext";

const { Provider, useStore } = createFastContext({
  first: "Filip",
  last: "Cholak",
});

const TextInput = ({ value }: { value: "first" | "last" }) => {
  const [fieldValue, setStore] = useStore((store) => store[value]);
  return (
    <div className="field">
      {value}:{" "}
      <input
        value={fieldValue}
        onChange={(evt) =>
          setStore({
            [value]: evt.target.value,
          })
        }
      />
    </div>
  );
};

const Display = ({ value }: { value: "first" | "last" }) => {
  const [fieldValue] = useStore((store) => store[value]);
  return (
    <div className="value">
      {value}: {fieldValue}
    </div>
  );
};

const FormContainer = () => {
  return (
    <div className="container">
      <h5>FormContainer</h5>
      <TextInput value="first" />
      <TextInput value="last" />
    </div>
  );
};

const DisplayContainer = () => {
  return (
    <div className="container">
      <h5>DisplayContainer</h5>
      <Display value="first" />
      <Display value="last" />
    </div>
  );
};

const ContentContainer = () => {
  return (
    <div className="container">
      <h5>ContentContainer</h5>
      <FormContainer />
      <DisplayContainer />
    </div>
  );
};

/*
  We have to find a way to have the data at top level but not with useState and
  not causing re-render. Don't useReducer (same problem), but!!! we can use refs
  When data changes it doesn't force re-renders
  1) We need a different communication mechanism with useRef (storeData and cps)
  2) We should use pub-sub model ( the text input subscribes and gets callback)
*/

function App() {
  const store = useState({
    first: "",
    second: "",
  });

  return (
    <Provider>
      <div className="container">
        <h5>App</h5>
        <ContentContainer />
      </div>
    </Provider>
  );
}

export default App;
