import { BrowserRouter, Routes, Route } from "react-router-dom";
import HealthPage from "./pages/HealthPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HealthPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;