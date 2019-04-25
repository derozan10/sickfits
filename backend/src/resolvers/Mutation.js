const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeMail } = require('../mail');
const { hasPermission } = require('../utils');

const mutations = {
  async createItem(parent, args, ctx, info) {
    const item = await ctx.db.mutation.createItem({
      data: {
        ...args, user: {
          connect: {
            id: ctx.request.user.id
          }
        }
      }
    }, info)

    return item;
  },
  async deleteItem(parent, args, ctx, info) {
    // return error if not logged in
    if (!ctx.request.user) {
      throw new Error('you must be logged in to delete an item')
    }
    const where = { id: args.id };
    // 1. find the item
    const item = await ctx.db.query.item({ where }, `{
      id
      user {
        id
      }
      title
    }`);
    // 2. Check if they own that item, or have the permissions
    const ownsItem = item.user ? item.user.id === ctx.request.userId : false
    const hasPermission = ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission))

    // 3. Delete it!
    if (ownsItem || hasPermission) {
      return ctx.db.mutation.deleteItem({ where }, info);
    } else {
      throw new Error('You do not have permission to delete this item')
    }
  },
  async updateItem(parent, args, ctx, info) {
    const updates = { ...args }
    delete updates.id
    return ctx.db.mutation.updateItem({
      data: updates,
      where: { id: args.id }
    }, info)
  },

  async signup(parent, args, ctx, info) {
    //lowercase the email
    args.email = args.email.toLowerCase();
    //hash the pswd
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER'] }
      },
    }, info)
    //creat a JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, //1 year cookie
    })

    return user;
  },

  async signin(parent, args, ctx, info) {
    const user = await ctx.db.query.user({ where: { email: args.email.toLowerCase() } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }

    const valid = await bcrypt.compare(args.password, user.password);
    if (!valid) {
      throw new Error('Invalid password!');
    }
    //creat a JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, //1 year cookie
    })
    return user
  },

  async signout(parent, args, ctx, info) {
    await ctx.response.clearCookie('token');
    return { message: 'Goodbye!' }
  },

  async requestReset(parent, { email }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    const randomBytesPromisified = promisify(randomBytes)
    const resetToken = (await randomBytesPromisified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      data: { resetToken, resetTokenExpiry },
      where: { email }
    })
    await transport.sendMail({
      from: 'lucas.vanremoortere@gmail.com',
      to: user.email,
      subject: 'your password reset token',
      html: makeMail(`your password reset token is here!
      \n \n <a href="${process.env.FRONTEND_URL}/reset&resetToken=${resetToken}">set your new password</a>`)
    })

    return { message: 'new resetToken created' }
  },

  // resetPassword(resetToken: String!, password: String!, confirmPassword: String!): User!
  async resetPassword(parent, args, ctx, info) {
    const { resetToken, password, confirmPassword } = args;
    if (password !== confirmPassword) {
      throw new Error("passwords don't match")
    }
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    })
    if (!user) {
      throw new Error("This token is invalid or expired")
    }
    const encryptedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await ctx.db.mutation.updateUser({
      data: { password: encryptedPassword, resetToken: null, resetTokenExpiry: null },
      where: { id: user.id }
    })

    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET)
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, //1 year cookie
    })
    return updatedUser;
  },

  async updatePermissions(parent, { permissions, userId }, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!');
    }
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId,
        },
      },
      info
    );
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
    return ctx.db.mutation.updateUser({
      data: {
        permissions: {
          set: permissions
        }
      },
      where: {
        id: userId
      }
    }, info)
  },
  async addToCart(parent, { itemId, quantity }, ctx, info) {
    //check if user is logged in
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('You must be logged to purchase an item')
    }
    //update the quantity for existing items
    const [existingItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: itemId },
      }
    })
    if (existingItem) {
      return await ctx.db.mutation.updateCartItem({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + 1 }
      }, info)
    }
    //add the item to the cart if not yet in there
    return await ctx.db.mutation.createCartItem({
      data: {
        item: { connect: { id: itemId } },
        user: { connect: { id: userId } }
      }
    })
  },
  async removeFromCart(parent, args, ctx, info) {
    // 1. Find the cart item
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id,
        },
      },
      `{ id, user { id }}`
    );
    // 1.5 Make sure we found an item
    if (!cartItem) throw new Error('No CartItem Found!');
    // 2. Make sure they own that cart item
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error('Cheatin huhhhh');
    }
    // 3. Delete that cart item
    return ctx.db.mutation.deleteCartItem(
      {
        where: { id: args.id },
      },
      info
    );
  },
}

module.exports = mutations
