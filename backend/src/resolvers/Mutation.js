const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeMail } = require('../mail');

const mutations = {
  async createItem(parent, args, ctx, info) {
    const item = await ctx.db.mutation.createItem({
      data: { ...args }
    }, info)

    return item;
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. find the item
    const item = await ctx.db.query.item({ where }, `{ id title}`);
    // 2. Check if they own that item, or have the permissions
    // TODO
    // 3. Delete it!
    return ctx.db.mutation.deleteItem({ where }, info);
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
  }
}

module.exports = mutations
