const Query = {
  users(parent, args, ctx, info) {
    return [{
      name: 'luciano pavarotti',
      capacities: 'ball so hard',
    }]
  },
}

module.exports = Query
