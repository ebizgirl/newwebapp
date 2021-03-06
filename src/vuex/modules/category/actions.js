import wordpressService from '../../../app.service'
const getCategory = ({commit, state, dispatch}, params) => {
  return new Promise((resolve, reject) => {
    if (!params.categorySlug && !params.parentId) {
      params.categorySlug = state.categories[0].slug
    }
    wordpressService.getCategory(null, params.categorySlug, params.parentId).then((responseCategories) => {
      var postPromises = []
      if (!params.page) {
        params.page = 1
      }
      state.page = params.page

      for (var i = 0; i < responseCategories.length; i++) {
        const responseCategory = responseCategories[i]
        const category = {
          id: responseCategory.id,
          name: responseCategory.name,
          title: responseCategory.name,
          slug: responseCategory.slug,
          better_featured_image: responseCategory.better_featured_image
        }
        postPromises.push(getCategoryPosts({commit, state}, {category, page: params.page}))
      }
      Promise.all(postPromises).then(resolveCategories => {
        state.categories = resolveCategories
        resolve()
      })
    }).catch(error => {
      reject(error)
    })
  })
}

const getCategoryPosts = ({commit, state}, params) => {
  return new Promise((resolve, reject) => {
    wordpressService.getPosts(params.category.id, params.page, 6).then((category) => {
      params.category.posts = category.posts
      params.category.totalPages = category.totalPages
      resolve(params.category)
    }).catch(error => {
      reject(new Error(error))
    })
  })
}

const getPost = ({commit, state}, postSlug) => {
  return wordpressService.getPost(null, postSlug).then((post) => {
    commit('POST_UPDATED', post[0])
  }).catch(error => {
    console.log(error)
  })
}

export {
  getCategory,
  getCategoryPosts,
  getPost
}
