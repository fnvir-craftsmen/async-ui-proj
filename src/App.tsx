import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { QueryModeProvider } from "./context/QueryModeContext";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <QueryModeProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </QueryModeProvider>
  );
}

export default App;
