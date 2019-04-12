const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

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
    console.log(updates)
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
}

module.exports = mutations
