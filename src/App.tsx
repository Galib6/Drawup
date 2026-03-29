import { Navigate, Route, Routes } from "react-router-dom";
import { Paths } from "@base/constants/paths";
import AuthGate from "./components/auth/AuthGate";
import Archive from "./views/Archive";
import AuthResetPassword from "./views/AuthResetPassword";
import AuthValidate from "./views/AuthValidate";
import SignIn from "./views/SignIn";
import SignUp from "./views/SignUp";
import WorkSpace from "./views/WorkSpace";

function App(): JSX.Element {
  return (
    <Routes>
      <Route element={<AuthGate />}>
        <Route path="/" element={<WorkSpace />} />
        <Route path="/archive" element={<Archive />} />
        <Route path={Paths.auth.login} element={<SignIn />} />
        <Route path={Paths.auth.signup} element={<SignUp />} />
        <Route path={Paths.auth.validate} element={<AuthValidate />} />
        <Route path={Paths.auth.resetPass} element={<AuthResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
