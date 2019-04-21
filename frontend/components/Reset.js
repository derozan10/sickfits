import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

const RESET_PASSPORT_MUTATION = gql`
  mutation RESET_PASSPORT_MUTATION(
    $resetToken: String!
    $password: String!
    $confirmedPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmedPassword
    ) {
      name
      email
    }
  }
`;

class Reset extends Component {
  state = {
    password: '',
    confirmedPassword: '',
  };

  submitHandler = async (e, fn) => {
    e.preventDefault();
    await fn();
    this.setState({
      password: '',
      confirmedPassword: '',
    });
  };

  saveToState = e => this.setState({ [e.target.name]: e.target.value });

  render() {
    const { resetToken } = this.props.query;
    const { password, confirmedPassword } = this.state;

    return (
      <Mutation
        mutation={RESET_PASSPORT_MUTATION}
        variables={{
          resetToken,
          password,
          confirmedPassword,
        }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(reqRest, { error, loading, called }) => (
          <Form method="POST" onSubmit={e => this.submitHandler(e, reqRest)}>
            <Error error={error} />
            {!error && !loading && called && <p>Your password is changed</p>}
            <fieldset disabled={loading || called} aria-busy={loading}>
              <label htmlFor="password">
                new password
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  value={this.state.password}
                  onChange={this.saveToState}
                />
              </label>
              <label htmlFor="confirmedPassword">
                Confirm new password
                <input
                  type="password"
                  name="confirmedPassword"
                  placeholder="password confirmation"
                  value={this.state.confirmedPassword}
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

export default Reset;
