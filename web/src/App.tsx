// App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Manager from "./pages/Manager.jsx";
import About from "./pages/About";
import Contact from "./pages/Contact";

function App() {
  return (
    <div id="app">
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Manager />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
}

export default App;
