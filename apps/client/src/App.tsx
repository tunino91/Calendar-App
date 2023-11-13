import "./App.css";
import { Route, Routes } from "react-router-dom";
import Users from "./pages/users";
import { Student } from "./pages/users/student";
import { Coach } from "./pages/users/coach";

function App() {
  return (
    <>
      <Routes>
        <Route path={"/"} element={<Users />} />
        <Route path={"/students/:id"} element={<Student />} />
        <Route path={"/coaches/:id"} element={<Coach />} />
        <Route path={"*"} element={<h1>Not Found</h1>} />
      </Routes>
    </>
  );
}

export default App;
