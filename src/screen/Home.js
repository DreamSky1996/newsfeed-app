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
import { makeStyles } from '@material-ui/core/styles';
import styles from '../App.css'; 

import ArticleCardComponent from '../components/ArticleCardComponent';
import {getArticleListApi, getLocationListApi, getLocationApi} from '../api/apiList';

const { REACT_APP_PAGES_URL } = process.env;
const { REACT_APP_OPACITY } = process.env;
const { REACT_APP_VERSION } = process.env;



global.g_lat = null;
global.g_lng = null;
global.apiCallFlag = false;
global.delayFlag = false;

const EXPIRETIME = 30 * 24 * 60 * 60 * 1000 // 30days

export default class Home extends React.Component {
      
    
        constructor (props) {
            super(props);
            var cookie_name = Cookies.get("user_id") || "";
            var cookie_location = Cookies.get("curLocation") || "";
            var inputLocation = {
                "name": cookie_location
            };
            this.state = {
                checked: true,
                locations:[],
                data:[],
                page:1,
                visitedList: [],
                searchValue: "",
                inputValue: inputLocation,
                user_id : cookie_name,
                curLocation : cookie_location,
                locationLoaingFlag: false,
                loading:false
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
                var location_obj = {
                    "name": location
                }
                this.setState({
                    inputValue: location_obj,
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
       
            } else {
                this.prev = window.scrollY;
                window.addEventListener('scroll',e => this.trackScrolling(e));
    
                var cookie_name = Cookies.get("user_id") || "";
                var cookie_location = Cookies.get("curLocation") || "";
                
                if(localStorage.getItem("myData")){
                    global.apiCallFlag = false;
                    var init_data = JSON.parse(localStorage.getItem("myData"))
                    var checked = this.state.checked;
                    var init_visitedList = [];
                    const now = new Date();
                    if(now.getTime() < init_data.expiry) {
                        init_visitedList = init_data.visitedList;
                    }
                    var inputLocation = {
                        "name": init_data.location
                    }
                    this.setState({
                        checked: checked,
                        locations:[],
                        page: init_data.page,
                        data: init_data.data,
                        visitedList: init_visitedList,
                        inputValue: inputLocation,
                        searchValue: "",
                        user_id :  init_data.user_id,
                        curLocation : init_data.location,
                    });
                }else{
                    getArticleListApi(1, cookie_location, cookie_name)
                    .then(res => {
                        if(res != null) {
                            console.log(res);
                            var inputLocation = {
                                "name": res.location
                            }
                            this.setState({
                                data:res.articles,
                                page:1,
                                inputValue: inputLocation,
                                user_id :res.user_id,
                                curLocation: res.location
                            });
                            const now = new Date();
                            var tem_data = {
                                page:1,
                                data: res.articles,
                                user_id :res.user_id,
                                location: res.location,
                                visitedList: this.state.visitedList,
                                expiry: now.getTime() + EXPIRETIME,
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

        /**
         * This function handle mouse scroll event.
         */
        trackScrolling = (e) => {
            if(window.innerWidth >= 1024) {
                this.setState({
                    checked: true
                });
            } else {
                if (this.prev > window.scrollY) {
                    // scroll up
                    this.setState({
                        checked: true
                    });
    
                } else if (this.prev < window.scrollY) {
                    // scroll down
                    this.setState({
                        checked: false
                    });
                }
    
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
                        const now = new Date();
                        var tem_data = {
                          page: page1,
                          data: temp_Data,
                          user_id :res.user_id,
                          location: res.location,
                          visitedList: this.state.visitedList,
                          expiry: now.getTime() + EXPIRETIME,
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
        /**
         * This function handle location string change event 
         */
        handleChangeText = (event, newInputValue) => {
            this.setState({ searchValue: newInputValue });
            console.log(newInputValue);
            if(newInputValue.length >= 3) {
                if(!this.isIncludeStr(newInputValue)) {
                    getLocationListApi(newInputValue)
                .then(res => {
                    if(res != null) {
                        this.setState({
                            locations: res['locations']
                        });
                    }
                    
                });
                } 
                
            } else if(newInputValue.length < 3) {
                this.setState({
                    locations: []
                });
            }
        }
        
        /**
         * This function handle location list select event.
         */
        handleInputChange = (event, newValue) => {
            
            if(newValue){
                this.setState({
                    inputValue: newValue,
                    loading:true
                });

                this.getArticleList(1, newValue.name, this.state.user_id);
            }
            
        };

        /**
         * This function handle location button click event.
         */
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
            this.setState({
                locationLoaingFlag: true
            });
            this.timerID = setInterval(
                this.tick,
                1000
            );

            
        }
        /**
         * This function is checked whether to check string in the loction list.
         */
        isIncludeStr(str) {
            var locations = this.state.locations;
            if(locations.length == 0) {
                return false;
            }
            for(var i = 0 ; i < locations.length ; i++) {
                var ret = locations[i].name.includes(str);
                if(ret) {
                    return true;
                }
            }

            return false;
        }
        /**
         * This function handle timer event.
         * This function get loction sting from coordinate using location Api.
         * and then get article list form location string.
         */
        tick = () => {
            if(global.g_lat != null && global.g_lng != null) {
                getLocationApi(global.g_lat, global.g_lng)
                .then(res => {
                    if(res != null) {
                        console.log(res);
                        var json = JSON.parse(res);
                        var address_components = json['results'][0]['address_components'];
                        var locality = "";
                        var state = "";
                        var postal_code = "";

                        for (var i = 0; i < address_components.length; i++) {
                            if (address_components[i]['types'][0] == 'locality' && address_components[i]['types'][1] == 'political') {
                                locality = address_components[i]['long_name']
                            }
                            if (address_components[i]['types'][0] == 'administrative_area_level_1' && address_components[i]['types'][1] == 'political') {
                                state = address_components[i]['short_name']
                            }
                            if (address_components[i]['types'][0] == 'postal_code') {
                                postal_code = address_components[i]['long_name']
                            }
                        } 

                        var result = {
                            "name": locality + ", " + state + " " + postal_code
                        };
                        this.setState({
                            inputValue: result,
                            locationLoaingFlag: false
                        });
                        this.getArticleList(1, result.name, this.state.user_id);
                    } else {
                        alert('Not find location!');
                        this.setState({
                            inputValue: {"name":""},
                            locationLoaingFlag: false
                        });
                    }
                })
                clearInterval(this.timerID);
            }
        }
        /**
         * This function handle timer event.
         * This function is redirected to article url after 2 seconds.
         */
        redirectTick = () => {
            if(global.delayFlag) {
                clearInterval(this.timerID);
                var url = REACT_APP_PAGES_URL + this.state.user_id + "/article.html"
                window.location.replace(url);
            }
            global.delayFlag = true;
        }

        /**
         * This function get article list using article api.
         * params: page(number), location(string), user_did(string)
         */

        getArticleList(page, location, user_id) {
            console.log('scroll end');
            getArticleListApi(page, location, user_id)
                .then(res => {
                    this.setState({
                        loading:false
                    });
                    if(res != null) {
                        console.log(res.articles);
                        this.setState({
                            data:res.articles,
                            page:page,
                            curLocation: location,
                            user_id :res.user_id,
                        });
                        const now = new Date();
                        var tem_data = {
                            page:page,
                            data: res.articles,
                            user_id: res.user_id,
                            location: res.location,
                            visitedList:this.state.visitedList,
                            expiry: now.getTime() + EXPIRETIME,
                        };
                        localStorage.setItem("myData",
                            JSON.stringify(tem_data) 
                        );
                        Cookies.set('user_id',res.user_id);
                        Cookies.set('curLocation', location);
                    } else {
                        this.setState({
                            data:[],
                            page:0,
                            curLocation: "",
                            user_id :"",
                        });
                        const now = new Date();
                        var tem_data = {
                            page:null,
                            data: null,
                            user_id: "",
                            location: "",
                            visitedList: [],
                            expiry: now.getTime(),
                        };
                        localStorage.setItem("myData",
                            JSON.stringify(tem_data) 
                        );
                        Cookies.set('user_id',"");
                        Cookies.set('curLocation', "");
                    }
                });
        }

        /**
         * This function handle article click event.
         * This function save clicked article ID.
         */
        handeClickArticle(objectID) {
            var tempVisitedList = this.state.visitedList;
            if(tempVisitedList.includes(objectID) == false) {
                tempVisitedList.push(objectID);
                this.setState({
                    visitedList: tempVisitedList,
                });
                const now = new Date();
                var tem_data = {
                    page:this.state.page,
                    data: this.state.data,
                    user_id :this.state.user_id,
                    location: this.state.curLocation,
                    visitedList:tempVisitedList,
                    expiry: now.getTime() + EXPIRETIME,
                };
                localStorage.setItem("myData",
                            JSON.stringify(tem_data) 
                        );
            }
           
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
                            zIndex:9999
                            }}

                    >
                        <Paper style ={{width:'100%'}}>
                            <div style={{display:"flex", alignItems:"center", backgroundColor:'royalblue',}}>
                                <img style={{marginLeft:10, width: 32, height: 32}} src={process.env.PUBLIC_URL + "/favicon.ico"}/>
                                <h3 style={{paddingLeft:10, fontSize: 20, fontFamily: "Courier New"}}>News on Page Two v{REACT_APP_VERSION}</h3>
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
                                    
                                    getOptionLabel={(option) => (option?option.name:"")}
                                    renderInput={(params) => (
                                    <TextField 
                                        {...params}  
                                        margin="normal" 
                                        variant="outlined" 
                                        placeholder="Enter Location or Postcode"
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
                                        this.state.locationLoaingFlag? <CircularProgress size={24} /> : <GpsFixedIcon/>
                                    }
                                    
                                </IconButton>
                                    
                            </div>
                        </Paper>
                    </Drawer>
                  <Container maxWidth="md" style={{paddingTop:150}}>
                      { 
                        !this.state.loading?(
                            this.state.data?(this.state.data.map((item) =>(
                                <a style={{
                                    paddingRight: 10,
                                    textDecoration:"none",}}
                                    href={REACT_APP_PAGES_URL + item.object_id + "/article.html"} 
                                    onClick={() => this.handeClickArticle(item.object_id)}
                                    >

                                    <div style={{opacity:this.state.visitedList.includes(item.object_id)?REACT_APP_OPACITY:1}}>
                                        <ArticleCardComponent key={item.object_id} item={item}/>
                                    </div>
                                    
                                </a>
                            ))):""
                        ):<CircularProgress color="secondary" size={50} style={{position:'fixed', top:"50%"}} />
                      }
                  </Container>
                </React.Fragment>
              );
        }

}