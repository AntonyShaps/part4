
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
    const initial = 0
    const blogLikes = blogs.map(blog => blog.likes)
    const result = blogLikes.reduce((adder, currentValue) => adder+currentValue, initial)
    return result
}

const favoriteBlog = (blogs) => {
    const blogLikes = blogs.map(blog => blog.likes)
    const max = blogLikes.reduce((a, b) => Math.max(a, b), -Infinity)
    const result = blogs.filter(blog => blog.likes === max)
    return result[0]
}


const mostBlogs = (blogs) => {
  const blogAuthors = blogs.map(blog => blog.author)
  const uniqueAuthors = [...new Set(blogAuthors)]
  let maxBlogs = 0
  let mostBloggedAuthor = ''
  uniqueAuthors.forEach(author => {
    const count = blogs.filter(blog=> blog.author === author).length
    if (count > maxBlogs) {
      maxBlogs = count
      mostBloggedAuthor = author
    }
  })
  return {author: mostBloggedAuthor, blogs: maxBlogs}
}

const mostLikes = (blogs) => {
  const blogAuthors = blogs.map(blog => blog.author)
  const uniqueAuthors = [...new Set(blogAuthors)]
  let maxLikes = 0
  let mostLikedAuthor = ''
  uniqueAuthors.forEach(author => {
    const totalLikes = blogs.filter(blog=> blog.author === author)
                       .reduce((accumulator,currentBlog) =>accumulator+currentBlog.likes,0)
    if (totalLikes > maxLikes) {
      maxLikes = totalLikes
      mostLikedAuthor = author
    }
  })
  return {author: mostLikedAuthor, likes: maxLikes }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}