import { Navigate, Route, Routes } from "react-router-dom";
import Archive from "./views/Archive";
import WorkSpace from "./views/WorkSpace";

function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<WorkSpace />} />
      <Route path="/archive" element={<Archive />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
