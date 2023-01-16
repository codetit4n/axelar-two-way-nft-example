import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sender from "./pages/Sender";
import Receiver from "./pages/Receiver";
import Page404 from "./pages/Page404";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Sender />} />
        <Route path="receiver" element={<Receiver />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
