// src/App.jsx
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AppRoute from "./app/router/router";
import { store, persistor } from "./app/redux/store"; // Import both store and persistor

import "./App.css";
function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div className="App">
          <AppRoute />
        </div>
      </PersistGate>
    </Provider>
  );
}

export default App;
