import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GalleriesList } from "./GalleriesList";
import { Gallery } from "./Gallery";

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="" element={<GalleriesList />} />
        <Route path="gallery/:gallery/*" element={<Gallery />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
