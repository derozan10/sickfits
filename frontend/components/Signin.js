import React, { Component } from 'react';
import Link from 'next/link';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import User, { CURRENT_USER_QUERY } from './User';
import RequestReset from './RequestReset';

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
    password: '',
    email: '',
  };

  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  submitHandler = async (e, fn) => {
    e.preventDefault();
    await fn();
    this.setState({ password: '', email: '' });
  };

  render() {
    return (
      <>
        <User>
          {({ me }) => {
            if (me) {
              return <p>You are logged in. Shop away!</p>;
            }
            return (
              <Mutation
                mutation={SIGNINMUTATION}
                variables={this.state}
                refetchQueries={[{ query: CURRENT_USER_QUERY }]}
              >
                {(signin, { error, loading }) => (
                  <Form
                    method="POST"
                    onSubmit={e => this.submitHandler(e, signin)}
                  >
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
                      <p>
                        No account yet?{' '}
                        <Link href="/signup">
                          <a>Sign up!</a>
                        </Link>
                      </p>
                    </fieldset>
                  </Form>
                )}
              </Mutation>
            );
          }}
        </User>
        <RequestReset />
      </>
    );
  }
}

export default Signin;
