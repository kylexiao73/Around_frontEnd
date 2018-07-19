import React from 'react';
import {Tabs, Spin} from 'antd';
import {API_ROOT, GEO_OPTIONS, POS_KEY,AUTH_PREFIX,TOKEN_KEY} from '../constants'
import $ from 'jquery';
import {Gallery} from './Gallery'
import { CreatePostButton} from './CreatePostButton'
import { WrappedAroundMap } from './AroundMap'

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
        localStorage.setItem("POS_KEY",JSON.stringify({lat: latitude,lon:longitude}));
        this.loadNearbyPosts();
    }
    onFailedLoadGeolocation = () => {
        this.setState( {loadingGeoLocation: false, error: 'failed to load GeoLocation'});
    }
    loadNearbyPosts = (location, range) => {
        this.setState({ loadingPosts: true, error: '' });
        const { lat, lon } = location ? location : JSON.parse(localStorage.getItem(POS_KEY));
        const radius = range ? range : 200;
        $.ajax({
            url: `${API_ROOT}/search?lat=${lat}&lon=${lon}&range=${radius}`,
            method: 'GET',
            headers: {
                Authorization: `${AUTH_PREFIX} ${localStorage.getItem(TOKEN_KEY)}`,
            },
        }).then((response) => {
            console.log(response);
            this.setState({ posts: response || [],loadingPosts: false, error: '' });
        }, (response) => {
            console.log(response.responseText);
            this.setState({ loadingPosts: false, error: 'Failed to load posts!' });
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
                <TabPane tab="Map" key="2">
                    <WrappedAroundMap
                        googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyC4R6AN7SmujjPUIGKdyao2Kqitzr1kiRg&v=3.exp&libraries=geometry,drawing,places"
                        loadingElement={<div style={{ height: `100%` }} />}
                        containerElement={<div style={{ height: `600px` }} />}
                        mapElement={<div style={{ height: `100%` }} />}
                        posts = {this.state.posts}
                        loadNearbyPosts = {this.loadNearbyPosts}
                    />
                </TabPane>
            </Tabs>
        )
    }
}