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

}

module.exports = mutations
