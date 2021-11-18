const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// { 
// 	id: 'uuid', // precisa ser um uuid
// 	name: 'Danilo Vieira', 
// 	username: 'danilo', 
// 	todos: []
// }

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers
  const user = users.find(item => item.username === username)

  if(!username){
    return  response.status(404).json({error: 'user not exists'})
  }
 
  request.user = user
  return next()
  
}

app.post('/users', (request, response) => {
  const {name, username} = request.body
  const user = {
  	id: uuidv4(),
    name, 
   	username, 
    todos: []
  }

  if(users.some(element => element.username == user.username)){
    return  response.status(400).json({error: 'user already exists'})
  }

users.push(user)
 return  response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers
  const {user} = request

   if(username === user.username){
    return response.status(200).json(user.todos)
  }else{
    return response.status(400).json({error:'user not found'})
  }

 
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const {user} = request
  const {title, deadline} = request.body
  const todo ={
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }
  
  if(user.todos.some(element => element.id === todo.id)){
    return  response.status(404).json({error: 'todo already exists'})
  }
 
    user.todos.push(todo)
    return response.status(201).json(todo)
 

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadline} = request.body
  const {id}= request.params

 let todo = user.todos.find(item =>item.id === id)

 const verifytodo = user.todos.some(element => element.id == id)


 
 if(verifytodo === false){
  return  response.status(404).json({error: 'not exists'})
}

 todo.title = title
 todo.deadline = deadline

 

return response.status(200).json(todo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {

  const {user} = request  
  const {done}= request.body
  const {id} = request.params

 const todo = user.todos.find(item =>item.id === id )
 if(!todo){
  return response.status(404).json({error:'not exists'})
 }
 todo.done = done
 

return response.status(200).json(todo)


});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
 
  const {user} = request   
  const {id} = request.params

  const todo = user.todos.find(item =>item.id === id )


  if(!todo){
  return  response.status(404).json({error: 'not exists'})
 }

  user.todos.splice(todo, 1)
  return response.status(204).send()
});

module.exports = app;