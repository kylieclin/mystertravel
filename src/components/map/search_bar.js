import React from 'react';
import {Field, change, reduxForm} from 'redux-form';

import Input from './../general/input';

const SearchBar = props => {
    const {handleSubmit, search} = props;
    return (
        <form onSubmit={handleSubmit(search)} className="search-bar-form">
            <Field id="places" name="places" label="Enter a location" component={Input} classes="search-bar-field"/>
        </form>
    );
}

export default reduxForm({
    form: 'search-bar-form'
})(SearchBar);