import React from 'react';
import { signIn, signInWithToken } from '../actions';
import { connect } from 'react-redux';
class Login extends React.Component {
    state = { email: '', password: '' };
    componentDidMount() {
        const localToken = window.localStorage.getItem('token');
        if (localToken) {
            this.props.signInWithToken(localToken);
        }
    }
    onEmailChange = event => {
        this.setState({ email: event.target.value });
    };
    onPasswordChange = event => {
        this.setState({ password: event.target.value });
    };
    onFormSubmit = event => {
        event.preventDefault();
        console.log('submit');
        this.props.signIn(this.state.email, this.state.password);
    };
    renderLogIn() {
        console.log(this.props.isSignedIn);
        if (!this.props.isSignedIn) {
            return (
                <div
                    style={{
                        padding: '30px',
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    <form
                        className="ui form"
                        style={{ width: '100%' }}
                        onSubmit={this.onFormSubmit}
                    >
                        <div className="field">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                onChange={this.onEmailChange}
                                value={this.state.email}
                            ></input>
                        </div>
                        <div className="field">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                onChange={this.onPasswordChange}
                                value={this.state.password}
                            ></input>
                        </div>
                        <input
                            type="submit"
                            style={{ display: 'none' }}
                        ></input>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end'
                            }}
                        >
                            <div className="ui submit button">Login</div>
                        </div>
                    </form>
                </div>
            );
        } else {
            return <div>hello</div>;
        }
    }
    render() {
        return <div>{this.renderLogIn()}</div>;
    }
}

const mapStateToProps = state => {
    return {
        isSignedIn: state.auth.isSignedIn
    };
};
export default connect(mapStateToProps, { signIn, signInWithToken })(Login);
