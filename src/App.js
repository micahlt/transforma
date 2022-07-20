import { createContext } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import Convert from "./views/Convert";
import { Toaster, Position } from "@blueprintjs/core";

export const AppContext = createContext();

export const AppToaster = Toaster.create({
  position: Position.TOP,
});

function App() {
  return (
    <AppContext.Provider value={{ hello: "world" }}>
      <Routes>
        <Route path="/" index element={<Home />} />
        <Route path="/convert" index element={<Convert />} />
      </Routes>
    </AppContext.Provider>
  );
}

export default App;
