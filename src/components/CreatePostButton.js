import { Modal, Button,message } from 'antd';
import $ from 'jquery';
import React from 'react';
import {WrappedCreatePostForm} from './CreatePostForm'
import {API_ROOT, AUTH_PREFIX, POS_KEY, TOKEN_KEY,LOC_SHAKE} from '../constants'

export class CreatePostButton extends React.Component {
    state = {
        ModalText: 'Content of the modal',
        visible: false,
        confirmLoading: false,
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    }

    handleOk = () => {
        this.setState({
            confirmLoading: true,
        });
        this.form.validateFields((err, values) => {
           if(!err){
               const {lat,lon} = JSON.parse(localStorage.getItem(POS_KEY));
               const formData = new FormData();
               formData.set('lat', lat + Math.random() * LOC_SHAKE * 2 - LOC_SHAKE);
               formData.set('lon', lon + Math.random() * LOC_SHAKE * 2 - LOC_SHAKE);
               formData.set('message',values.message );
               formData.set('image',values.image[0].originFileObj );

               $.ajax({
                   url:`${API_ROOT}/post`,
                   method: 'POST',
                   data: formData,
                   headers: {
                       Authorization: `${AUTH_PREFIX} ${localStorage.getItem(TOKEN_KEY)}`
                   },
                   processData: false,
                   contentType: false,
                   dataType: 'text',

               }).then((response) =>{

                   message.success('Created a post successfully!')
                   this.form.resetFields();
                   this.setState({
                       visible: false,
                       confirmLoading: false,
                   });
                   this.props.loadNearbyPosts();
               },(error) =>{
                   message.error(error.responseText);
                   console.log(error);
                   this.setState({
                       confirmLoading: false,
                   });
               }).catch((error) =>{
                    console.log(error);
               });
           }

        });

        setTimeout(() => {
            this.setState({
                visible: false,
                confirmLoading: false,
            });
        }, 2000);
    }

    handleCancel = () => {
        console.log('Clicked cancel button');
        this.setState({
            visible: false,
        });
    }

    saveFormRef = (form) => {
        this.form = form;
    }

    render() {
        const { visible, confirmLoading } = this.state;
        return (
            <div>
                <Button type="primary" onClick={this.showModal}>Create New Post</Button>
                <Modal title="Create New Post"
                       visible={visible}
                       onOk={this.handleOk}
                       okText="Create"
                       confirmLoading={confirmLoading}
                       onCancel={this.handleCancel}
                >
                    <WrappedCreatePostForm ref = {this.saveFormRef}/>

                </Modal>
            </div>
        );
    }
}
