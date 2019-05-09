import React, {Component} from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import './summary.scss';
import {formatMoney} from './../../../helper';
import {clearTripId, signIn} from "../../../actions";
import {loadScript} from "./../../../helper";
import Timeline from './timeline';
import Map from './summary_map';
import ImageModal from './imagemodal';

class Summary extends Component {
    constructor(props) {
        super(props);

        this.state = {
            trips_id: null,
            tripName: '',
            totalSpent: 0,
            privatePage: null,
            pinData: null,
            notes: null,
            imageModal: false,
            image: null,
            mapModal: false,
            pin: null,
            userId: null
        };

        this.endTrip = this.endTrip.bind(this);
    }

    componentDidMount() {
        const {params} = this.props.match;
        let privatePage, trips_id, userId;

        if(params && params.trips_id && params.userId) {
            privatePage = false;
            trips_id =  params.trips_id;
            userId = params.userId;
        } else {
            privatePage = true;
            trips_id = localStorage.getItem('trips_id');
            userId = localStorage.getItem('user_id');
        }

        this.setState({
            privatePage,
            trips_id,
            userId
        }, this.getSummaryData);

        loadScript('https://platform.twitter.com/widgets.js');
        this.checkLogin();
    }

    async checkLogin() {
        const resp = await axios.get(`/api/checkloggedin.php?token=${localStorage.getItem('token')}`);
        const {success, login} = resp.data;
        const {signIn} = this.props;

        if(success) {
            if(login) {
                signIn(resp.data);
            }
        }
    }

    async getSummaryData() {
        const {trips_id, userId} = this.state;
        const resp = await axios.get(`/api/getendtripsummary.php?trips_id=${trips_id}&users_id=${userId}`);

        if(resp.data.success) {
            const {summary: {trips_name, total_budget}, pins, notes} = resp.data;

            this.setState({
                tripName: trips_name,
                totalSpent: total_budget,
                pinData: pins,
                notes
            });
        } else {
            console.error(resp.data.error);
        }
    }

    async endTrip() {
        const resp = await axios.put('/api/endcurrenttrip.php', {token: localStorage.getItem('token')});

        if(resp.data.success) {
            this.props.clearTripId();
            this.props.history.push(`/`);
        }
    }

    fbButton = (url) => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=I went on a trip recently! Check it out on MysterTravel!`,
            "pop",
            "width=600, height=400, scrollbars=no"
        );
    }

    twitterButton(url) {
        return `https://twitter.com/intent/tweet?text=${
            encodeURIComponent(`I went on a trip recently! Check it out on MysterTravel!\n${url}`)
        }`;
    }

    mailButton(url) {
        return `mailto: ?subject=I went on a trip!&body=${
            encodeURIComponent(`I went on a trip recently! Check it out on MysterTravel!\n${url}`)
        }`;
    }

    setImage = image => {
        if(image) {
            this.setState({
                image: image,
                imageModal: true
            });
        }
    }
    
    buttonDisplay = () => {
         if(!this.props.auth && this.state.privatePage) {
            return (
                <div className="summary-end-trip-link">
                        <button onClick={()=>this.props.history.push('/account/signup')} className="summary-end-trip-link-btn btn">Sign Up to Save the Trip</button>
                </div>
            );
        } else if(this.state.privatePage) {
            return (
                <div className="summary-end-trip-link">
                        <button onClick={this.endTrip} className="summary-end-trip-link-btn btn">End Trip</button>
                </div>
            );
        } else {
            return null;
        }
    }

    toggleMapModal = () => {
        this.setState({
            mapModal: !this.state.mapModal
        });
    }

    toggleImageModal = () => {
        this.setState({
            imageModal: !this.state.imageModal
        });
    }

    render() {
        const {trips_id, tripName, totalSpent, privatePage, pinData, notes, mapModal, imageModal, image, userId} = this.state;
        const summaryURL = `https://www.mystertravel.com/trip/${userId}/${tripName.split(" ").join("-")}/${trips_id}`;

        return (
            <div className="summary-page">
                <div className="summary-trip-name"><p>{tripName? tripName : 'My Trip'}</p></div>
                <div className="total-spend"><div>{`Total spent on this trip $${totalSpent? formatMoney(totalSpent): ' 0'}`}</div></div>
                <Map />
                <div className="desktop-div">
                    <Timeline pinData={pinData} notesData={notes} setImage={this.setImage}/>
                    {privatePage && !this.props.guest &&
                        <div className="summary-end-trip-link">
                            <button onClick={this.endTrip} className="summary-end-trip-link-btn btn">End Trip</button>
                        </div>
                    }
                    <div className="share-btns col-12">
                            <a onClick={() => {this.fbButton(summaryURL)}}>
                                <i className="fab fa-facebook-square"/>
                            </a>
                            <a href={this.twitterButton(summaryURL)}>
                                <i className="fab fa-twitter-square"/>
                            </a>
                            <a href={this.mailButton(summaryURL)}>
                                <i className="fas fa-envelope-square"/>
                            </a>
                    </div>
                </div>
                <ImageModal img={image} modal={imageModal} close={this.toggleImageModal}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        trips_id: state.user.trips_id,
        auth: state.user.auth,
        guest: state.user.guest
    };
}

export default connect(mapStateToProps, {
    clearTripId,
    signIn
})(Summary);