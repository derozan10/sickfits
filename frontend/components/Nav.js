import Link from 'next/link';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import NavStyles from './styles/NavStyles';
import User, { CURRENT_USER_QUERY } from './User';
import { TOGGLE_CART_MUTATION } from './Cart';

const SIGNOUT_MUTATION = gql`
  mutation SIGNOUT_MUTATION {
    signout {
      message
    }
  }
`;
const Nav = () => (
  <User>
    {({ me }) => (
      <NavStyles>
        {me && (
          <>
            <p style={{ padding: '0 20px' }}>{me.name}</p>
            <Link href="/sell">
              <a>Sell</a>
            </Link>
            <Link href="/orders">
              <a>Orders</a>
            </Link>
            <Link href="/me">
              <a>Account</a>
            </Link>
          </>
        )}
        <Link href="/items">
          <a>Shop</a>
        </Link>
        {me ? (
          <Mutation
            mutation={SIGNOUT_MUTATION}
            refetchQueries={[{ query: CURRENT_USER_QUERY }]}
          >
            {(mutation, { error }) => (
              <button type="button" onClick={() => mutation()}>
                Signout
              </button>
            )}
          </Mutation>
        ) : (
          <Link href="/signin">
            <a>Signin</a>
          </Link>
        )}
        <Mutation mutation={TOGGLE_CART_MUTATION}>
          {toggleCart => <button onClick={() => toggleCart()}>my cart</button>}
        </Mutation>
      </NavStyles>
    )}
  </User>
);

export default Nav;
