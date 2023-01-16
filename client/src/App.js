import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from './Navbar'
import Footer from './Footer';
import Sender from "./pages/Sender";
import Receiver from "./pages/Receiver";
import Page404 from "./pages/Page404";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route index element={<Sender />} />
        <Route path="receiver" element={<Receiver />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
