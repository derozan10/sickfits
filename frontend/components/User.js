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
      cart {
        item {
          id
          title
          description
          image
          price
        }
        id
        quantity
      }
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
