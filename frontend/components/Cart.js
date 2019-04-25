import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { adopt } from 'react-adopt';
import User from './User';
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';
import CartItem from './CartItem';
import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';
import TakeMyMoney from './TakeMyMoney';

export const LOCAL_STATE_QUERY = gql`
  query LOCAL_STATE_QUERY {
    cartOpen @client
  }
`;

export const TOGGLE_CART_MUTATION = gql`
  mutation TOGGLE_CART_MUTATION {
    toggleCart @client
  }
`;

class Cart extends Component {
  render() {
    return (
      <User>
        {({ me }) => {
          const { cart } = me;
          return (
            <>
              <Mutation mutation={TOGGLE_CART_MUTATION}>
                {toggleCart => (
                  <Query query={LOCAL_STATE_QUERY}>
                    {({ data }) => (
                      <CartStyles open={data.cartOpen}>
                        <header>
                          <CloseButton
                            title="close"
                            onClick={() => toggleCart()}
                          >
                            &times;
                          </CloseButton>
                          <Supreme>Your Cart</Supreme>
                          <p>
                            {`You have ${cart.length} item ${
                              cart.length === 1 ? '' : 's'
                            } in your cart`}
                          </p>
                        </header>
                        <ul>
                          {cart.map(cartItem => (
                            <CartItem key={cartItem.id} cartItem={cartItem} />
                          ))}
                        </ul>
                        <footer>
                          <p>{formatMoney(calcTotalPrice(me.cart))}</p>
                          {cart.length && (
                            // <TakeMyMoney>
                            <SickButton>Checkout</SickButton>
                            // </TakeMyMoney>
                          )}
                        </footer>
                      </CartStyles>
                    )}
                  </Query>
                )}
              </Mutation>
            </>
          );
        }}
      </User>
    );
  }
}

export default Cart;
