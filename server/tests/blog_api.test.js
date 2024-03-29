const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('API GET tests', () => {
  test('all blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api
      .get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('unique identifier property of the blog posts is named id', async () => {
    const response = await api
      .get('/api/blogs')
    expect(response.body[0]._id).not.toBeDefined()
    expect(response.body[0].id).toBeDefined()
  })

  test('a blog with specific id is returned as json', async () => {
    await api
      .get(`/api/blogs/${helper.initialBlogs[0]._id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('a returned blog has the correct id', async () => {
    const blog = helper.initialBlogs[0]
    const returnedBlog = await api
      .get(`/api/blogs/${blog._id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(returnedBlog.body.id).toBe(blog._id)
  })
})

describe('API POST tests', () => {
  test('a valid blog can be added', async () => {
    const users = await helper.usersInDatabase()

    //login with existing username and password to get token
    const auth = await api
      .post('/api/login')
      .send({ username: 'root', password: 'secret' })
    const token = auth.body.token

    const newBlog = {
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 0,
      userId: users[0].id,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', 'bearer ' + token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfterPosting = await helper.blogsInDatabase()

    const blogListLength = blogsAfterPosting.length

    //blog expected to be added
    expect(blogsAfterPosting).toHaveLength(helper.initialBlogs.length + 1)
    //blog with correct data expected to be added (title, author and url)
    expect(blogsAfterPosting[blogListLength - 1].title).toContain(
      newBlog.title
    )
    expect(blogsAfterPosting[blogListLength - 1].author).toContain(
      newBlog.author
    )
    expect(blogsAfterPosting[blogListLength - 1].url).toContain(
      newBlog.url
    )
  })

  test('if likes is not given, it is set to zero', async () => {
    const users = await helper.usersInDatabase()

    //login with existing username and password to get token
    const auth = await api
      .post('/api/login')
      .send({ username: 'root', password: 'secret' })
    const token = auth.body.token

    const newBlog = {
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      userId: users[0].id,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', 'bearer ' + token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfterPosting = await helper.blogsInDatabase()

    const blogListLength = blogsAfterPosting.length

    //blog expected to be added
    expect(blogsAfterPosting).toHaveLength(helper.initialBlogs.length + 1)
    //likes is expected to set to zero
    expect(blogsAfterPosting[blogListLength - 1].likes).toBe(0)
  })

  test('if title is not given returns bad request 400', async () => {
    const users = await helper.usersInDatabase()

    //login with existing username and password to get token
    const auth = await api
      .post('/api/login')
      .send({ username: 'root', password: 'secret' })
    const token = auth.body.token

    const newBlog = {
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      userId: users[0].id,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', 'bearer ' + token)
      .send(newBlog)
      .expect(400)
  })

  test('if url is not given returns bad request 400', async () => {
    const users = await helper.usersInDatabase()

    //login with existing username and password to get token
    const auth = await api
      .post('/api/login')
      .send({ username: 'root', password: 'secret' })
    const token = auth.body.token

    const newBlog = {
      title: 'React patterns',
      author: 'Michael Chan',
      userId: users[0].id,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', 'bearer ' + token)
      .send(newBlog)
      .expect(400)
  })

  test('if token is not included in request returns 401 unauthorized', async () => {
    const users = await helper.usersInDatabase()

    const newBlog = {
      title: 'React patterns',
      author: 'Michael Chan',
      userId: users[0].id,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  })
})

describe('API PUT tests', () => {
  test('likes increased by one', async () => {
    const blog = helper.initialBlogs[0]

    //original likes
    const originalLikes = blog.likes
    //increase likes by one
    blog.likes += 1

    const response = await api
      .put(`/api/blogs/${blog._id}`)
      .send(blog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    //likes of blog expected to be increased by one
    expect(response.body.likes).toBe(originalLikes + 1)
  })
})

afterAll(() => {
  mongoose.connection.close()
})