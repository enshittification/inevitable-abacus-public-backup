import { Typography } from '@material-ui/core'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { Alert } from '@material-ui/lab'
import { Field } from 'formik'
import { TextField } from 'formik-material-ui'
import React from 'react'

import PrivateLink from 'src/components/general/PrivateLink'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    p2EntryField: {
      marginTop: theme.spacing(4),
      width: '100%',
      background: '#fff',
    },
    beginButton: {
      display: 'block',
      width: '10rem',
    },
  }),
)

const Beginning = (): JSX.Element => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Typography variant='h4' gutterBottom>
        Design and Document Your Experiment
      </Typography>
      <Typography variant='body2'>
        We think one of the best ways to prevent a failed experiment is by documenting what you hope to learn.{/* */}
        <br />
        <br />
      </Typography>
      <Alert severity='info'>
        Our{' '}
        <PrivateLink underline='always' href='https://wp.me/PCYsg-Hs4' target='_blank'>
          FieldGuide
        </PrivateLink>{' '}
        is a great place to start, it will instruct you on{' '}
        <PrivateLink underline='always' href='https://wp.me/PCYsg-Gek' target='_blank'>
          documenting your experiment
        </PrivateLink>{' '}
        and creating a post on{' '}
        <PrivateLink underline='always' href='https://wp.me/bxNRc' target='_blank'>
          a8cexperiments
        </PrivateLink>{' '}
        P2.
      </Alert>
      <Field
        className={classes.p2EntryField}
        component={TextField}
        id='experiment.p2Url'
        name='experiment.p2Url'
        placeholder='https://a8cexperiments.wordpress.com/your-experiment-url'
        label='Your a8cexperiments P2 post URL'
        helperText='Can be added later. Required for launching the experiment.'
        variant='outlined'
        InputLabelProps={{
          shrink: true,
        }}
      />
    </div>
  )
}

export default Beginning
