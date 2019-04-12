import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';

const SIGNUPMUTATION = gql`
  mutation SIGNUPMUTATION($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name) {
      id
      name
      email
    }
  }
`;

const SIGNINMUTATION = gql`
  mutation SIGNINMUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      name
      email
    }
  }
`;

class Signin extends Component {
  state = {
    name: '',
    password: '',
    email: '',
  };

  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  submitHandler = async (e, signup) => {
    e.preventDefault();
    await signup();
    this.setState({ name: '', password: '', email: '' });
  };

  render() {
    return (
      <>
        <Mutation mutation={SIGNUPMUTATION} variables={this.state}>
          {(signup, { error, loading }) => (
            <Form method="POST" onSubmit={e => this.submitHandler(e, signup)}>
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Sign Up</h2>
                <Error error={error} />
                <label htmlFor="email">
                  Email
                  <input
                    type="email"
                    name="email"
                    placeholder="email"
                    autoComplete="email"
                    value={this.state.email}
                    onChange={this.saveToState}
                  />
                </label>
                <label htmlFor="name">
                  Name
                  <input
                    type="text"
                    name="name"
                    placeholder="name"
                    autoComplete="username"
                    value={this.state.name}
                    onChange={this.saveToState}
                  />
                </label>
                <label htmlFor="password">
                  Password
                  <input
                    type="password"
                    name="password"
                    placeholder="password"
                    autoComplete="current-password"
                    value={this.state.password}
                    onChange={this.saveToState}
                  />
                </label>

                <button type="submit">Sign In!</button>
              </fieldset>
            </Form>
          )}
        </Mutation>
        <Mutation mutation={SIGNINMUTATION} variables={this.state}>
          {(signin, { error, loading }) => (
            <Form method="POST" onSubmit={e => this.submitHandler(e, signin)}>
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Sign In</h2>
                <Error error={error} />
                <label htmlFor="email">
                  Email
                  <input
                    type="email"
                    name="email"
                    placeholder="email"
                    value={this.state.email}
                    onChange={this.saveToState}
                  />
                </label>
                <label htmlFor="password">
                  Password
                  <input
                    type="password"
                    name="password"
                    placeholder="password"
                    autoComplete="current-password"
                    value={this.state.password}
                    onChange={this.saveToState}
                  />
                </label>

                <button type="submit">Sign In!</button>
              </fieldset>
            </Form>
          )}
        </Mutation>
      </>
    );
  }
}

export default Signin;
