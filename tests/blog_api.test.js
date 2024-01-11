const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('id defined', async () => {
  const response = await helper.nonExistingId()
  expect(response).toBeDefined()
})

test('if likes are undefined, default to 0', async () => {
  const newBlog = {
    title: 'async/await simplifies making async calls',
    author: 'matti',
    url: 'fullstack',
    likes:''
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get(`/api/blogs/`)
  expect(response.body.slice(-1)[0].likes).toEqual(0)
})
test('if title or url are undefined, 400', async () => {
  const newBlog = {
    title: "",
    author: 'matti',
    url: "",
    likes:''
  }

  await api
    .post('/api/blogs')
    .expect(400)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('a specific blog is within the returned blogs', async () => {
  const response = await api.get('/api/blogs')
  const contents = response.body.map(r => r.url)
  expect(contents).toContain(
    'https://reactpatterns.com/'
  )
})
test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'matti',
      url: 'fullstack',
      likes: 1,
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const response = await api.get('/api/blogs')
  
    const contents = response.body.map(r => r.title)
  
    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(contents).toContain(
      'async/await simplifies making async calls'
    )
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const contents = blogsAtEnd.map(r => r.id)

    expect(contents).not.toContain(blogToDelete.id)
  })
})

describe('update of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const updatedBlog = {
      ...blogToUpdate,
      likes:5
    }

    await api
      .put(`/api/blogs/${updatedBlog.id}`)
      .send(updatedBlog)
      .expect(200)

    const blogsAtEnd = await api.get(`/api/blogs/${updatedBlog.id}`)

    expect(blogsAtEnd.body.likes).toEqual(5)
  })
})
describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
})
afterAll(async () => {
  await mongoose.connection.close()
})