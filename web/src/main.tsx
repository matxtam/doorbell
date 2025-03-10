import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
		<Provider store={store}>
			<Router>
				<App />
			</Router>
		</Provider>
  </React.StrictMode>
);

