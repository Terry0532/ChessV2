import React, { Component } from 'react';
import { Form, Button } from 'react-bootstrap';
class GetUserDetail extends Component {
    state = {
        name: "",
        nameTaken: false
    }
    componentDidMount() {
        this.props.socket.on('checkUserDetailResponse', data => {
            this.props.registrationConfirmation(data);
            if (!data) {
                this.setState({ nameTaken: true })
            } else {
                this.setState({ nameTaken: false })
            }
        });
    }
    submitName = (e) => {
        e.preventDefault();
        this.props.socket.emit('checkUserDetail', { "name": this.state.name });
    };
    onNameChange = (e) => {
        this.setState({ name: e.target.value });
    };
    render() {
        return (
            <Form onSubmit={this.submitName}>
                <Form.Group >
                    <Form.Label>Enter Your Name</Form.Label>
                    <Form.Control type="text" value={this.state.mobileNumber} onChange={this.onNameChange} placeholder="Name" />
                    <Form.Text className="text-muted"></Form.Text>
                    <Button onClick={this.submitName} variant="primary" type="button">
                        Submit
                    </Button>
                    {this.state.nameTaken ? <p>This username is taken, choose a different username.</p> : <p></p>}
                </Form.Group>
            </Form>
        );
    }
}

export default GetUserDetail;