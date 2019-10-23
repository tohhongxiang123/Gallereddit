import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import FrontPage from './components/FrontPage/FrontPage';
import Navigation from './components/Navigation/Navigation';
import Login from './components/Login';
import {UserProvider} from './UserContext';
import {SubredditProvider} from './SubredditContext';

function App() {
  return (
    <UserProvider>
      <SubredditProvider>
          <Router>
            <Navigation />
            <div className="content">
            <Switch>
              <Route path="/login">
                <Login />
              </Route>
              <Route path="/user/:posttype">
                <FrontPage type="user"/>
              </Route>
              <Route path="/:subreddit?/:category?/:duration?">
                <FrontPage type="post"/>
              </Route>
            </Switch>
          </div>
          </Router>
      </SubredditProvider>
    </UserProvider>
  );
}

export default App;
