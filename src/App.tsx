import { Navigate, Route, Routes } from "react-router-dom";
import WorkSpace from "./views/WorkSpace";

function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<WorkSpace />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
