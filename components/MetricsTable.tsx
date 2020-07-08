import {
  createStyles,
  LinearProgress,
  makeStyles,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  useTheme,
} from '@material-ui/core'
import debugFactory from 'debug'
import MaterialTable from 'material-table'
import React, { useEffect, useState } from 'react'

import MetricsApi from '@/api/MetricsApi'
import { MetricBare, MetricFull } from '@/models'
import { formatBoolean } from '@/utils/formatters'
import { defaultTableOptions } from '@/utils/material-table'

const debug = debugFactory('abacus:components/MetricsTable.tsx')

const useMetricDetailStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2, 8),
      background: theme.palette.action.hover,
    },
    headerCell: {
      fontWeight: 'bold',
      width: '9rem',
      verticalAlign: 'top',
    },
    dataCell: {
      fontFamily: theme.custom.fonts.monospace,
    },
    pre: {
      whiteSpace: 'pre',
      maxHeight: '15rem',
      overflow: 'scroll',
      padding: theme.spacing(1),
      borderWidth: 1,
      borderColor: theme.palette.divider,
      borderStyle: 'solid',
      background: '#fff',
    },
  }),
)

const MetricDetail = ({ metricBare }: { metricBare: MetricBare }) => {
  const classes = useMetricDetailStyles()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [metricFull, setMetricFull] = useState<MetricFull | null>(null)
  useEffect(() => {
    setIsLoading(true)
    MetricsApi.findById(metricBare.metricId)
      .then(setMetricFull)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [metricBare.metricId])

  return (
    <>
      <Snackbar open={!!error} message='Oops! Something went wrong while trying to load a Metric.' />
      {isLoading && <LinearProgress />}
      {!isLoading && !error && metricFull && (
        <TableContainer className={classes.root}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className={classes.headerCell}>Higher is Better:</TableCell>
                <TableCell className={classes.dataCell}>{formatBoolean(metricFull.higherIsBetter)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.headerCell}>Parameters:</TableCell>
                <TableCell className={classes.dataCell}>
                  <div className={classes.pre}>
                    {JSON.stringify(
                      metricFull.parameterType === 'conversion' ? metricFull.eventParams : metricFull.revenueParams,
                      null,
                      4,
                    )}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}

/**
 * Renders a table of "bare" metric information.
 */
const MetricsTable = ({ metrics }: { metrics: MetricBare[] }) => {
  debug('MetricsTable#render')

  const theme = useTheme()
  const tableColumns = [
    {
      title: 'Name',
      field: 'name',
      cellStyle: {
        fontFamily: theme.custom.fonts.monospace,
        fontWeight: theme.custom.fontWeights.monospaceBold,
      },
    },
    {
      title: 'Description',
      field: 'description',
      cellStyle: {
        fontFamily: theme.custom.fonts.monospace,
      },
    },
    {
      title: 'Parameter Type',
      field: 'parameterType',
      cellStyle: {
        fontFamily: theme.custom.fonts.monospace,
      },
    },
  ]

  return (
    <MaterialTable
      columns={tableColumns}
      data={metrics}
      onRowClick={(_event, _rowData, togglePanel) => togglePanel && togglePanel()}
      options={defaultTableOptions}
      detailPanel={(rowData) => <MetricDetail metricBare={rowData} />}
    />
  )
}

export default MetricsTable