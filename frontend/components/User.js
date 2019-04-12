import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import propTypes from 'prop-types';

export const CURRENT_USER_QUERY = gql`
  query CURRENT_USER_QUERY {
    me {
      id
      email
      name
      permissions
    }
  }
`;

const User = props => (
  <Query query={CURRENT_USER_QUERY} {...props}>
    {({ data }) => props.children(data)}
  </Query>
);

User.propTypes = {
  children: propTypes.func.isRequired,
};

export default User;
