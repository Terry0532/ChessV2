import React, { Component, Fragment } from 'react';
import { ListGroup } from 'react-bootstrap';
class ShowUsers extends Component {
    constructor() {
        super();
        this.state = {
            opponents: []
        };
    }
    componentDidMount() {
        this.props.socket.on('getOpponentsResponse', data => {
            console.log("12")
            this.setState({
                opponents: data
            });
        });
        this.props.socket.on('newOpponentAdded', data => {
            console.log("18")
            this.setState({
                opponents: [...this.state.opponents, data]
            });
        });
        this.props.socket.on('opponentDisconnected', data => {
            var flag = false;
            var i = 0;
            for (i = 0; i < this.state.opponents.length; i++) {
                if (this.state.opponents[i].id === data.id) {
                    flag = true;
                    break;
                }
            }
            if (flag) {
                var array = [...this.state.opponents];
                array.splice(i, 1);
                this.setState({ opponents: array });
            }
        });
        this.props.socket.on('excludePlayers', data => {
            for (var j = 0; j < data.length; j++) {
                var flag = false;
                var i = 0;
                for (i = 0; i < this.state.opponents.length; i++) {
                    if (this.state.opponents[i].id === data[j]) {
                        flag = true;
                        break;
                    }
                }
                if (flag) {
                    var array = [...this.state.opponents];
                    array.splice(i, 1);
                    this.setState({ opponents: array });
                }
            }

        });
        this.props.socket.on("alreayInGame", data => {
            for (var j = 0; j < data.length; j++) {
                var flag = false;
                var i = 0;
                for (i = 0; i < this.state.opponents.length; i++) {
                    if (this.state.opponents[i].id === data[j]) {
                        flag = true;
                        break;
                    }
                }
                if (flag) {
                    var array = [...this.state.opponents];
                    array.splice(i, 1);
                    this.setState({ opponents: array });
                }
            }
        });
        this.props.socket.on('gameStarted', data => {
            this.props.gameStartConfirmation(data);
        });

        console.log("get opponent")
        this.props.socket.emit('getOpponents', {});
    }
    selectOpponent = (index) => {
        console.log("select opponent")
        console.log(index)
        console.log(this.state.opponents[index].id)
        this.props.socket.emit('selectOpponent', { "id": this.state.opponents[index].id });
    };
    render() {
        return (
            <Fragment>
                <h2>Please select opponent from the following</h2>
                <ListGroup onSelect={this.selectOpponent}>
                    {this.state.opponents.map(function (opponent, index) {
                        return <ListGroup.Item action={true} className="opponent-item" key={index} eventKey={index} >{opponent.name} | Played : {opponent.played}  | Won : {opponent.won}  | Draw : {opponent.draw}</ListGroup.Item>;
                    })}
                </ListGroup></Fragment>
        );
    }
}

export default ShowUsers;