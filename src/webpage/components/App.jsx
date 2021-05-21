import React from "react";
import { HashRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import Nav from "./Nav";
import Create from "./Create";
import Manage from "./Manage";
import Help from "./Help";
import {createUseStyles} from 'react-jss';

const style = createUseStyles({
  wrapper: {
    display: "flex",
    flexDirection: "row",
    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
    margin: "0 auto",
    maxWidth: "1400px",
  },
  main: { 
    flex: 5, 
    backgroundColor: "rgb(231, 231, 231)" 
  }
});

const App = () => {
  const classes = style();
  return (
    <Router>
      <div className={classes.wrapper}>
        <Nav />
        <main className={classes.main}>
          <Switch>
            <Route path="/" exact>
              <Redirect to="/Manage" />
            </Route>
            <Route path="/Manage" exact component={Manage} />
            <Route path="/Create" exact component={Create} />
            <Route path="/Help" exact component={Help} />
          </Switch>
        </main>
      </div>
    </Router>
  );
};

export default App;
