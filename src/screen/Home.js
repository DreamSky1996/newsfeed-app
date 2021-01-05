import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import FilterListIcon from '@material-ui/icons/FilterList';
import GpsFixedIcon from '@material-ui/icons/GpsFixed';
import Drawer from '@material-ui/core/Drawer';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import IconButton from '@material-ui/core/IconButton';
import Cookies from 'js-cookie';
import { Helmet } from 'react-helmet'
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import CircularProgress from '@material-ui/core/CircularProgress';

import ArticleCardComponent from '../components/ArticleCardComponent';
import {getArticleListApi, getLocationListApi, getLocationApi} from '../api/apiList';

const { REACT_APP_PAGES_URL } = process.env;

global.g_lat = null;
global.g_lng = null;
global.apiCallFlag = false;
global.delayFlag = false;
global.locationPrekeyLength = 0;
export default class Home extends React.Component {
      
        constructor (props) {
            super(props);
            var cookie_name = Cookies.get("user_id") || "";
            var cookie_location = Cookies.get("curLocation") || "";
            this.state = {
                checked: true,
                locations:[],
                data:[],
                page:1,
                searchValue: "",
                inputValue: cookie_location,
                user_id : cookie_name,
                curLocation : cookie_location,
                locationLoaingFlag: false,
            };
        }

        componentDidMount() {
            // get objectId and location from url
            let search = window.location.search;
            let params = new URLSearchParams(search);
            let P_object_id = params.get('object_id');
            let P_location = params.get('location');
            
            if(P_location !=null && P_object_id !=null ) {
                var location = P_location.replaceAll("%20", " ");
                this.setState({
                    inputValue: location,
                    user_id :P_object_id,
                });
                getArticleListApi(1, location, P_object_id)
                .then(res => {
                    if(res != null) {
                        console.log(res);
                        this.setState({
                            data:res.articles,
                            page:1,
                            inputValue: location,
                            user_id :res.user_id,
                            curLocation: res.location
                        });
                        this.timerID = setInterval(
                            this.redirectTick,
                            2000
                        );
                    }
                });
                // this.timerID = setInterval(
                //     this.redirectTick,
                //     2000
                // );
            } else {
                this.prev = window.scrollY;
                window.addEventListener('scroll',e => this.trackScrolling(e));
    
                var cookie_name = Cookies.get("user_id") || "";
                var cookie_location = Cookies.get("curLocation") || "";
                if(localStorage.getItem("myData")){
                    global.apiCallFlag = false;
                    var init_data = JSON.parse(localStorage.getItem("myData"))
                    var checked = this.state.checked;
                    this.setState({
                        checked: checked,
                        locations:[],
                        page: init_data.page,
                        data: init_data.data,
                        inputValue: cookie_location,
                        searchValue: "",
                        user_id :  cookie_name,
                        curLocation : cookie_location,
                    });
                }else{
                    getArticleListApi(1, cookie_location, cookie_name)
                    .then(res => {
                        if(res != null) {
                            console.log(res);
                            this.setState({
                                data:res.articles,
                                page:1,
                                inputValue: res.location,
                                user_id :res.user_id,
                                curLocation: res.location
                            });
                            var tem_data = {
                                page:1,
                                data: res.articles
                            };
                            localStorage.setItem("myData",
                                JSON.stringify(tem_data) 
                            );
                            Cookies.set('user_id',res.user_id);
                            Cookies.set('curLocation', res.location);
                            global.apiCallFlag = false;
                        }
                    });
                }
            }
            
        }
        
        componentWillUnmount() {
            window.removeEventListener('scroll', this.trackScrolling);
        }

        trackScrolling = (e) => {
            if (this.prev > window.scrollY) {
                console.log("scrolling up");
                this.setState({
                    checked: true
                });

            } else if (this.prev < window.scrollY) {
                console.log("scrolling down");
                this.setState({
                    checked: false
                });
            }

            this.prev = window.scrollY;
            
            if ((1.5 * window.innerHeight + window.scrollY)>= document.body.offsetHeight) {
                if(global.apiCallFlag){
                    return;
                }
              console.log('header bottom reached');
              window.removeEventListener('scroll', this.trackScrolling);
              var page1 = this.state.page  + 1;
              global.apiCallFlag = true;
              getArticleListApi(page1, this.state.curLocation, this.state.user_id)
              .then(res => {
                  if(res != null) {
                    console.log(res.articles);
                    if (res.articles === undefined || res.articles.length === 0) {
                        console.log("End.")
                    }else{
                        var temp_Data = this.state.data.concat(res.articles);
                        this.setState({
                            data:temp_Data,
                            page: page1,
                            user_id :res.user_id,
                            curLocation: res.location
                        });
                        var tem_data = {
                          page: page1,
                          data: temp_Data
                        };
                        localStorage.setItem("myData",
                            JSON.stringify(tem_data) 
                        );
                        Cookies.set('user_id',res.user_id);
                        Cookies.set('curLocation', res.location);
                    }
                  }
                   window.addEventListener('scroll', this.trackScrolling);
                   global.apiCallFlag = false;
              });
            }
        };

        handleChangeText = (event, newInputValue) => {
            this.setState({ searchValue: newInputValue });
            console.log(newInputValue);
            if(newInputValue.length === 3 && global.locationPrekeyLength < 3) {
                this.setState({
                    locationLoaingFlag: true
                });
                getLocationListApi(newInputValue)
                .then(res => {
                    if(res != null) {
                        this.setState({
                            locations: res['locations']
                        });
                    }
                    this.setState({
                        locationLoaingFlag: false
                    });
                });
            } else if(newInputValue.length < 3) {
                this.setState({
                    locations: []
                });
            }
            global.locationPrekeyLength = newInputValue.length;
        }
        
        handleInputChange = (event, newValue) => {
            console.log(newValue);
            this.setState({
                inputValue: newValue
            });
            if(newValue){
                this.getArticleList(1, newValue, this.state.user_id);
            }
            
        };

        handleIconBtnClick = () => {

            function success(position) {
                global.g_lat  = position.coords.latitude;
                global.g_lng = position.coords.longitude;
            }

            function error() {
            	console.log('Unable to retrieve your location');
            }

            if(!navigator.geolocation) {
                console.log('Geolocation is not supported by your browser');
            } else {
                console.log('Locating…');
                navigator.geolocation.getCurrentPosition(success, error);
            }
            
            console.log('click');
            this.timerID = setInterval(
                this.tick,
                500
            );

            
        }
        
        tick = () => {
            if(global.g_lat != null && global.g_lng != null) {
                getLocationApi(global.g_lat, global.g_lng)
                .then(res => {
                    if(res != null) {
                        console.log(res);
                        var json = JSON.parse(res);
                        var address = json['results'][0]['address_components'];
                        var suburb = "";
                        var postcode = "";

                        address.forEach(function(entry) {
                            if (entry[['types']][0] == "locality") { suburb = entry['long_name']; }
                            if (entry[['types']][0] == "postal_code") { postcode = entry['long_name']; }
                        });

                        var result = suburb + ", " + postcode;

                        this.setState({
                            inputValue: result,
                        });
                        this.getArticleList(1, result, this.state.user_id);
                    } else {
                        alert('Not find location!');
                        this.setState({
                            inputValue: "",
                        });
                    }
                })
                clearInterval(this.timerID);
            }
        }

        redirectTick = () => {
            if(global.delayFlag) {
                clearInterval(this.timerID);
                var url = REACT_APP_PAGES_URL + this.state.user_id + "/article.html"
                window.location.replace(url);
            }
            global.delayFlag = true;
        }


        getArticleList(page, location, user_id) {
            console.log('scroll end');
            getArticleListApi(page, location, user_id)
                .then(res => {
                    if(res != null) {
                        console.log(res.articles);
                        this.setState({
                            data:res.articles,
                            page:page,
                            curLocation: location,
                            user_id :res.user_id
                        });
                        var tem_data = {
                            page:page,
                            data: res.articles
                        };
                        localStorage.setItem("myData",
                            JSON.stringify(tem_data) 
                        );
                        Cookies.set('user_id',res.user_id);
                        Cookies.set('curLocation', location);
                    }
                });
        }
        render () {
            return (
                <React.Fragment>
                    <Helmet>
                        <title>Page Two</title>
                    </Helmet>
                    <CssBaseline />
                    <Drawer
                        variant="persistent"
                        anchor="top"
                        open={this.state.checked}
                        style={{
                            position:"fixed",
                            width: '100%',
                            textAlign:"initial",
                            height: 100,
                            flexShrink: 0,
                            }}

                    >
                        <Paper style ={{width:'100%'}}>
                            <div style={{display:"flex", alignItems:"center", backgroundColor:'royalblue',}}>
                                <img style={{marginLeft:10, width: 14, height: 20}} src={process.env.PUBLIC_URL + "/favicon.png"}/>
                                <h3 style={{paddingLeft:10, fontSize: 20, fontFamily: "Courier New"}}>News on Page Two</h3>
                            </div>
                            <div style={{display:"flex", alignItems:"center",}}>
                                <Autocomplete
                                    style={{width:"-webkit-fill-available",marginRight:10, paddingLeft:10}}
                                    freeSolo
                                    value={this.state.inputValue}
                                    onChange={this.handleInputChange}
                                    inputValue={this.state.searchValue}
                                    onInputChange={this.handleChangeText}
                                    options={this.state.locations}
                                    getOptionLabel={(option) => option.name}
                                    renderInput={(params) => (
                                    <TextField 
                                        {...params}  
                                        margin="normal" 
                                        variant="outlined" 
                                        />
                                    )}
                                    renderOption={(option, { inputValue }) => {
                                        const matches = match(option.name, inputValue);
                                        const parts = parse(option.name, matches);
                                
                                        return (
                                          <div style={{width:"100%"}}>
                                              <div style={{float:'left'}}>
                                                {parts.map((part, index) => (
                                                    <span key={index} style={{ fontWeight: part.highlight ? 700 : 400,backgroundColor: part.highlight ?'yellow': 'white' }}>
                                                        {part.text}
                                                    </span>
                                                ))}
                                              </div>
                                            <span style={{float:'right'}}>{option.council}</span>
                                          </div>
                                        );
                                      }}
                                />
                                <IconButton 
                                    onClick={this.handleIconBtnClick}
                                    style={{marginRight:10, border: 0, backgroundColor:"transparent"}} >
                                    {
                                        this.state.locationLoaingFlag? <CircularProgress /> : <GpsFixedIcon/>
                                    }
                                    
                                </IconButton>
                                    
                            </div>
                        </Paper>
                    </Drawer>
                  <Container maxWidth="md" style={{paddingTop:150}}>
                      {
                        this.state.data?(this.state.data.map((item) =>(
                                <a style={{
                                    paddingRight: 10,
                                    textDecoration:"none"}}
                                    href={REACT_APP_PAGES_URL + item.object_id + "/article.html"} >
                                    <ArticleCardComponent key={item.object_id} item={item}/>
                                </a>
                            ))):""
                      }
                  </Container>
                </React.Fragment>
              );
        }

}