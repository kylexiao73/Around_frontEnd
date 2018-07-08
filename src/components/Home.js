import React from 'react';
import {Tabs, Spin} from 'antd';
import {API_ROOT, GEO_OPTIONS, POS_KEY,AUTH_PREFIX,TOKEN_KEY} from '../constants'
import $ from 'jquery';
import {Gallery} from './Gallery'
import { CreatePostButton} from './CreatePostButton'

const TabPane = Tabs.TabPane;


export class Home extends React.Component{
    state = {
        loadingGeoLocation: false,
        error: '',
        loadingPost: false,
        posts: [],


    }
    componentDidMount(){
        this.setState( {loadingGeoLocation: true,error: ''});
        this.getGeoLocation();

    }
    getGeoLocation = () => {
        if ("geolocation" in navigator) {
            /* geolocation is available */

            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeolocation,
                this.onFailedLoadGeolocation,
                {
                    GEO_OPTIONS,
                });
        } else {
            /* geolocation IS NOT available */
            this.setState( {loadingGeoLocation: false,error: 'GeoLocation is not available'});
        }
    }
    onSuccessLoadGeolocation = (position) => {
        console.log(position);
        this.setState( {loadingGeoLocation: false});
        const {latitude, longitude} = position.coords;
        localStorage.setItem("POS_KEY",JSON.stringify({lat: latitude,long:longitude}));
        this.loadNearbyPosts();
    }
    onFailedLoadGeolocation = () => {
        this.setState( {loadingGeoLocation: false, error: 'failed to load GeoLocation'});
    }
    loadNearbyPosts = () => {
        const {lat,lon} = JSON.parse(localStorage.getItem(POS_KEY));
        this.setState({ loadingPosts: true, error: ''});
        $.ajax({
            url: `${API_ROOT}/search?lat=${lat}&lon=${lon}&range=20000`,
            method: 'GET',
            headers: {
                Authorization: `${AUTH_PREFIX} ${localStorage.getItem(TOKEN_KEY)}`
            },
        }).then((response) => {
            this.setState({ posts: response, loadingPosts: false, error: '' });
            console.log(response);
        }, (error) => {
            this.setState({ loadingPosts: false, error: error.responseText });
            console.log(error);
        }).catch((error) => {
            console.log(error);
        });

    }
    getGalleryPanelContent = () => {
        if (this.state.error) {
            return <div>{this.state.error}</div>
        }
        else if (this.state.loadingGeoLocation) {
            return <Spin tip="Loading geo location..."/>
        }
        else if (this.state.loadingPosts) {
            return <Spin tip="Loading posts..."/>
        }
        else if(this.state.posts && this.state.posts.length>0){
            const image = this.state.posts.map((post)=> {
                return {
                    user: post.user,
                    src: post.url,
                    thumbnail: post.url,
                    thumbnailWidth: 400,
                    thumbnailHeight: 300,
                    caption: post.message,
                }
            });
            return <Gallery images={image}/>
        }
        else return null;
    }
    render(){
        const createPostButton = <CreatePostButton/>;
        return(
            <Tabs tabBarExtraContent={createPostButton} className="main-tabs">
                <TabPane tab="Post" key="1">
                    {this.getGalleryPanelContent()}

                    </TabPane>
                <TabPane tab="Map" key="2">Content of tab 2</TabPane>
            </Tabs>
        )
    }
}