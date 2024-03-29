import React from 'react'
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom'

import AuthCallback from 'src/pages/AuthCallback'
import Experiment from 'src/pages/explat/experiments/Experiment'
import ExperimentsAgGrid from 'src/pages/explat/experiments/ExperimentsAgGrid'
import ExperimentWizard, { ExperimentWizardMode } from 'src/pages/explat/experiments/ExperimentWizard'
import Metric from 'src/pages/explat/Metric'
import Metrics from 'src/pages/explat/Metrics'
import Tags from 'src/pages/explat/Tags'

import { ExperimentView } from './components/explat/experiments/single-view/ExperimentPageView'
import { NotFound } from './pages/explat/NotFound'

/**
 * Let's keep routing simple and minimal.
 * - Do not use dynamic or nested routing!
 * - Get all your route information at the top level.
 * - Try not to delete or change an existing route: comment a route as deprecated and redirect.
 */
export default function Routes(): JSX.Element {
  return (
    <Router>
      <Switch>
        <Route path='/' exact>
          <Redirect to='/experiments' />
        </Route>

        <Route path='/auth' exact>
          <AuthCallback />
        </Route>

        <Route path='/experiments' exact>
          <ExperimentsAgGrid />
        </Route>

        <Route path='/experiments/new' exact>
          <ExperimentWizard experimentWizardMode={ExperimentWizardMode.Create} />
        </Route>
        <Route path='/experiments/:experimentIdSlug/wizard-edit' exact>
          <ExperimentWizard experimentWizardMode={ExperimentWizardMode.Edit} />
        </Route>
        <Route path='/experiments/:experimentIdSlug/clone' exact>
          <ExperimentWizard experimentWizardMode={ExperimentWizardMode.Clone} />
        </Route>
        <Route path='/experiments/:experimentIdSlug/' exact>
          <Experiment />
        </Route>
        {Object.values(ExperimentView).map((view) => (
          <Route
            key={`/experiments/:experimentIdSlug/:view(${view})`}
            path={`/experiments/:experimentIdSlug/:view(${view})`}
            exact
          >
            <Experiment />
          </Route>
        ))}

        <Route path='/metrics' exact>
          <Metrics />
        </Route>
        <Route path='/metrics/:metricIdSlug' exact>
          <Metric />
        </Route>

        <Route path='/tags' exact>
          <Tags />
        </Route>

        <Route path='*'>
          <NotFound />
        </Route>
      </Switch>
    </Router>
  )
}
