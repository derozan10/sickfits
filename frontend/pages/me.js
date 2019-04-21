import React from 'react';
import { userInfo } from 'os';
import User from '../components/User';

const me = () => (
  <>
    <User>
      {({ me }) =>
        me && (
          <>
            <h1>{me.name}</h1>
            <p>{me.permissions}</p>
            <p>{me.email}</p>
          </>
        )
      }
    </User>
  </>
);

export default me;
