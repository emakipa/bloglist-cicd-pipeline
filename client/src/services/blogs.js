import axios from 'axios'
// eslint-disable-next-line no-undef
const baseUrl = BACKEND_URL + '/api/blogs'

let token = null

const setToken = newToken => {
  token = `bearer ${newToken}`
}

//get all blogs
const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

//create new blog
const create = async (newBlogObject) => {
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.post(baseUrl, newBlogObject, config)
  return response.data
}

//update blog (increase likes)
const update = async (id, blogObject) => {
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.put(baseUrl + '/' + id, blogObject, config)
  return response.data
}

//remove blog
const remove = async (id) => {
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.delete(baseUrl + '/' + id, config)
  return response.data
}

export default { getAll, create, update, remove, setToken }