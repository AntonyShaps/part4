const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')


const initialBlogs =[
    {
        title: "Alfred is the best",
        author: "Herr Kozhitz",
        url: "nourl",
        likes: 0,
        id: "659ae23cd2f43196cf80c3e9"
    },
    {
        title: "probability of being born in Africa",
        author: "Jumanju Jumanjovic",
        url: "losturl",
        likes: 0,
        id: "659ae26fd2f43196cf80c3eb"
    }
]

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')


  expect(response.body).toHaveLength(initialBlogs.length)
})

test('a specific blog is within the returned blogs', async () => {
  const response = await api.get('/api/blogs')


  const contents = response.body.map(r => r.url)
  expect(contents).toContain(
    'losturl'
  )
})
test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'matti',
      url: 'fullstack',
      likes: 0
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const response = await api.get('/api/blogs')
  
    const contents = response.body.map(r => r.title)
  
    expect(response.body).toHaveLength(initialBlogs.length + 1)
    expect(contents).toContain(
      'async/await simplifies making async calls'
    )
})
afterAll(async () => {
  await mongoose.connection.close()
})