import React from 'react';
import css from './index.module.less';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import { LayoutMain, LayoutBlank } from '@/layout';
import { RouterBlank, RouterMain } from '@/router';

import PrivateRoute from '@/components/private-route';

const App = () => {
  const renderRouter = (router: any, routeProps: any) => {
    return router.child ? (
      router.child.map((item: any) => renderRouter(item, routeProps))
    ) : (
      <PrivateRoute
        exact={!!router.exact}
        key={router.path}
        path={router.path}
        name={router.name}
        {...routeProps}
        render={(props) => <router.component {...props} />}
      />
    );
  };

  return (
    <div className={css['app']}>
      <Router>
        <Switch>
          <Route
            path="/admin"
            render={(routeProps) => (
              <LayoutMain {...routeProps}>
                <Switch>
                  {RouterMain.map((router, index) => renderRouter(router, routeProps))}
                  <Redirect to="/admin/dashboard" from="/admin" exact />
                  <Redirect to="/404" />
                </Switch>
              </LayoutMain>
            )}
          />
          <Route
            path="/"
            render={(routeProps) => (
              <LayoutBlank {...routeProps}>
                <Switch>
                  {RouterBlank.map((router) => {
                    return router.child && router.child.length > 0 ? (
                      router.child.map((item: any) => (
                        <Route
                          exact={!!item.exact}
                          key={item.path}
                          path={item.path}
                          name={item.name}
                          component={item.component}
                        />
                      ))
                    ) : (
                      <Route
                        exact={!!router.exact}
                        key={router.path}
                        path={router.path}
                        name={router.name}
                        component={router.component}
                      />
                    );
                  })}
                  <Redirect exact to="/home" from="/" />
                  <Redirect to="/404" />
                </Switch>
              </LayoutBlank>
            )}
          />
          <Redirect to="/404" />
        </Switch>
      </Router>
    </div>
  );
};

export default App;
