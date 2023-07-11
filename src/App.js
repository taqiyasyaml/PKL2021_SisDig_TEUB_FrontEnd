
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom"
import Home from "./Home";
import Project from "./Project/Project";
function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/project/:projectId">
          <Project />
        </Route>
        <Route path="/404">
          Halaman Tidak Ditemukan
        </Route>
        <Route path="*">
          <Redirect to="/404" />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
