import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

const { REACT_APP_PAGES_URL } = process.env;

const useStyles = makeStyles((theme) => ({
  root: {
    margin: -8,
    padding: 4
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    width: "100%"
  },
  content: {
    flex: '1 0 auto',
    paddingLeft: 10
  },
  cover: {
    width: 151,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    justify:"space-between"
  },
  playIcon: {
    height: 38,
    width: 38,
  },
}));

export default function ArticleCardComponent(props) {

  const classes = useStyles();
  const hasThumbail = props['item']['thumbnail'];

  var img = null;
  var text = null;
  
  if (hasThumbail) {
    img = <img src={REACT_APP_PAGES_URL + props.item.object_id + "/thumbnail.jpg"} alt=""/>;
  } else {
    img = <div></div>;
  }

  return (
    <Card className={classes.root}>
      <div style={{display: 'flex', alignItems:"center", }}>
          <div className={classes.details} >
            <CardContent className={classes.content}>
                <Typography component="h5" variant="h5" style={{float:"left", textAlign: '-webkit-left'}}>
                    {props.item.title}
                </Typography>
            </CardContent>
            <Typography variant="subtitle1" color="textSecondary" style={{color:"seagreen", float:"left", textAlign: '-webkit-left', marginLeft:8}}>
                  {props.item.location_name}
                </Typography>
          </div>
          <div>
              {img}
          </div>
      </div>
      <div>
            <Typography variant="subtitle1" color="textSecondary" style={{textAlign:"left", lineHeight:1.5, marginLeft:8}}>
                 <div dangerouslySetInnerHTML={{__html: props.item.text}}></div>
            </Typography>
            <Grid className={classes.controls} justify="space-between">
                <Typography variant="subtitle1" color="textSecondary" style={{marginRight:8}}>
                 {props.item.timestamp}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" style={{marginRight:8}}>
                 {props.item.publisher_name}
                </Typography>                
            </Grid>
      </div>
    </Card>
  );
} 