import React, { Component } from 'react';
// import Link from 'next/link';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';

const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`;

class RequestReset extends Component {
  state = {
    email: '',
  };

  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  submitHandler = async (e, fn) => {
    e.preventDefault();
    await fn();
    this.setState({ email: '' });
  };

  render() {
    return (
      <Mutation mutation={REQUEST_RESET_MUTATION} variables={this.state}>
        {(reqRest, { error, loading, called }) => (
          <Form method="POST" onSubmit={e => this.submitHandler(e, reqRest)}>
            <Error error={error} />
            {!error && !loading && called && (
              <p>Succes, check your e-mail for further instructions</p>
            )}
            <p>Forgot your password? reset it here</p>
            <fieldset disabled={loading || called} aria-busy={loading}>
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
              <button type="submit">Reset password</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default RequestReset;
