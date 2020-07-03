import { Typography } from '@material-ui/core'
import _ from 'lodash'
import MaterialTable from 'material-table'
import React, { useMemo } from 'react'

import DatetimeText from '@/components/DatetimeText'
import {
  Analysis,
  AnalysisStrategyToHuman,
  AttributionWindowSecondsToHuman,
  ExperimentFull,
  MetricBare,
  Recommendation,
  RecommendationWarningToHuman,
  Variation,
} from '@/models'
import { createStaticTableOptions } from '@/utils/material-table'

/**
 * Convert a recommendation's endExperiment and chosenVariationId fields to a human-friendly description.
 */
function RecommendationString({
  recommendation,
  experiment,
}: {
  recommendation: Recommendation
  experiment: ExperimentFull
}) {
  if (recommendation.endExperiment) {
    if (recommendation.chosenVariationId) {
      const chosenVariation = experiment.variations.find(
        (variation) => variation.variationId === recommendation.chosenVariationId,
      ) as Variation
      return (
        <>
          End experiment; deploy <code>{chosenVariation.name}</code>
        </>
      )
    }
    return <>End experiment; deploy either variation</>
  }
  return <>Keep running</>
}

/**
 * Render a table of participant counts based on the latest metric analyses for the given experiment.
 */
function ParticipantCounts({
  experiment,
  latestPrimaryMetricAnalyses,
}: {
  experiment: ExperimentFull
  latestPrimaryMetricAnalyses: Analysis[]
}) {
  const sortedVariations = _.orderBy(experiment.variations, ['isDefault', 'name'], ['desc', 'asc'])
  const tableColumns = [
    { title: 'Strategy', render: ({ analysisStrategy }: Analysis) => AnalysisStrategyToHuman[analysisStrategy] },
    { title: 'Total', render: ({ participantStats }: Analysis) => participantStats.total },
  ]
  sortedVariations.forEach(({ variationId, name }) => {
    tableColumns.push({
      title: name,
      render: ({ participantStats }: Analysis) => participantStats[`variation_${variationId}`] || 0,
    })
  })
  return (
    <MaterialTable
      columns={tableColumns}
      data={latestPrimaryMetricAnalyses}
      options={createStaticTableOptions(latestPrimaryMetricAnalyses.length)}
    />
  )
}

/**
 * Render the latest results for the experiment for each metric assignment.
 *
 * Note: This is likely to change a lot as part of https://github.com/Automattic/abacus/issues/96.
 */
function LatestResults({
  experiment,
  metrics,
  metricAssignmentIdToLatestAnalyses,
}: {
  experiment: ExperimentFull
  metrics: MetricBare[]
  metricAssignmentIdToLatestAnalyses: { [key: number]: Analysis[] }
}) {
  // TODO: It'd be better to move some mappings to model methods once things are more stable. We should be able to make
  // TODO: calls like metricAssignment.getMetric().name and experiment.getMetricAssignmentById(123).getMetric().name
  // TODO: rather than construct mappings in the components.
  const metricsById = useMemo(() => _.zipObject(_.map(metrics, 'metricId'), metrics), [metrics])
  // Sort the assignments for consistency and collect the data we need to render the component.
  const resultSummaries = useMemo(() => {
    return _.orderBy(experiment.metricAssignments, ['isPrimary', 'metricAssignmentId'], ['desc', 'asc']).map(
      ({ metricAssignmentId, attributionWindowSeconds, metricId }) => {
        return {
          metricAssignmentId,
          attributionWindowSeconds,
          metricName: metricsById[metricId].name,
          latestAnalyses: metricAssignmentIdToLatestAnalyses[metricAssignmentId as number],
        }
      },
    )
  }, [experiment.metricAssignments, metricsById, metricAssignmentIdToLatestAnalyses])
  const tableColumns = [
    { title: 'Strategy', render: ({ analysisStrategy }: Analysis) => AnalysisStrategyToHuman[analysisStrategy] },
    {
      title: 'Participants (not final)',
      render: ({ participantStats }: Analysis) => `${participantStats.total} (${participantStats.not_final})`,
    },
    {
      title: 'Difference interval',
      render: ({ metricEstimates }: Analysis) =>
        metricEstimates
          ? `[${_.round(metricEstimates.diff.bottom, 4)}, ${_.round(metricEstimates.diff.top, 4)}]`
          : 'N/A',
    },
    {
      title: 'Recommendation',
      render: ({ recommendation }: Analysis) =>
        recommendation && <RecommendationString recommendation={recommendation} experiment={experiment} />,
    },
    {
      title: 'Warnings',
      render: ({ recommendation }: Analysis) => {
        if (!recommendation) {
          return ''
        }
        return (
          <>
            {recommendation.warnings.map((warning) => (
              <div key={warning}>{RecommendationWarningToHuman[warning]}</div>
            ))}
          </>
        )
      },
    },
  ]
  return (
    <>
      {resultSummaries.map(({ metricAssignmentId, metricName, attributionWindowSeconds, latestAnalyses }) => (
        <div key={metricAssignmentId}>
          <Typography variant={'subtitle1'}>
            <strong>
              <code>{metricName}</code>
            </strong>{' '}
            with {AttributionWindowSecondsToHuman[attributionWindowSeconds]} attribution, last analyzed on{' '}
            <DatetimeText datetime={latestAnalyses[0].analysisDatetime} excludeTime={true} />
          </Typography>
          <MaterialTable
            columns={tableColumns}
            data={latestAnalyses}
            options={createStaticTableOptions(latestAnalyses.length)}
          />
          <br />
        </div>
      ))}
    </>
  )
}

/**
 * Main component for summarizing experiment analyses.
 */
export default function AnalysisSummary({
  analyses,
  experiment,
  metrics,
  debugMode,
}: {
  analyses: Analysis[]
  experiment: ExperimentFull
  metrics: MetricBare[]
  debugMode?: boolean
}) {
  const metricAssignmentIdToLatestAnalyses = useMemo(
    () =>
      _.mapValues(_.groupBy(analyses, 'metricAssignmentId'), (metricAnalyses) => {
        metricAnalyses = _.orderBy(metricAnalyses, ['analysisDatetime'], ['desc'])
        return _.sortBy(
          _.filter(metricAnalyses, ['analysisDatetime', metricAnalyses[0].analysisDatetime]),
          'analysisStrategy',
        )
      }),
    [analyses],
  )

  if (analyses.length === 0) {
    return <h2>No analyses yet for {experiment.name}.</h2>
  }

  return (
    <>
      <h2>Analysis summary</h2>
      <p>Found {analyses.length} analysis objects in total.</p>

      <div className='analysis-participant-counts'>
        <h3>Participant counts for the primary metric</h3>
        <ParticipantCounts
          experiment={experiment}
          latestPrimaryMetricAnalyses={
            metricAssignmentIdToLatestAnalyses[experiment.getPrimaryMetricAssignmentId() as number]
          }
        />
      </div>

      <div className='analysis-latest-results'>
        <h3>Latest results by metric</h3>
        <LatestResults
          experiment={experiment}
          metrics={metrics}
          metricAssignmentIdToLatestAnalyses={metricAssignmentIdToLatestAnalyses}
        />
      </div>

      {debugMode ? <pre className='debug-json'>{JSON.stringify(analyses, null, 2)}</pre> : ''}
    </>
  )
}
