const mutations = {
  createUser(parent, args, ctx, info) {
    console.log(`${args.name} is created`)
  },
}

module.exports = mutations
