import React, { useState, useEffect } from "react";
import TodoForm from "./TodoForm";
import Todo from "./Todo";

function TodoList() {
  const [todos, setTodos] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/tasks/")
    .then(response => response.json())
    .then(data => {
      setTodos(data.tasks)
    })
  },[])

  const addTodo = (todo) => {
    if (!todo.title || /^\s*$/.test(todo.title)) {
      return;
    }

    async function postAndGetTasks(){
      const jsonObject = JSON.stringify(todo)
      await fetch('http://localhost:4000/tasks', 
      {
        method: 'POST', 
        body: jsonObject, 
        //se necesita el content type para decirle al backend que estructura le envias
        headers: {
          "Content-Type": "application/json"
        }
      })

      await fetch("http://localhost:4000/tasks/")
      .then(response => response.json())
      .then(data => {
        setTodos(data.tasks)
      })
    }

    postAndGetTasks()
  };

  const showDescription = (todoId) => {
    let updatedTodos = todos.map((todo) => {
      if (todo.id === todoId) {
        todo.showDescription = !todo.showDescription;
      }
      return todo;
    });
    setTodos(updatedTodos);
  };

  const updateTodo = (todoId, newValue) => {
    if (!newValue.title || /^\s*$/.test(newValue.title)) {
      return;
    }

    async function updateTaskAndGetAllTasks(){
      //obtener el tiempe de justo ahora
      const date = new Date()
      let requestBody = {
        title: newValue.title,
        description: newValue.description,
        // ..toLocaleString("us") convierte el objeto date a este formato: 7/3/2023, 9:13:34 PM
        lastEdit: date.toLocaleString("us")
      }
      requestBody = JSON.stringify(requestBody)

      await fetch(`http://localhost:4000/tasks/${todoId}`, 
      { 
        method: 'PATCH',
        body: requestBody,
        headers: {
          "Content-Type": "application/json"
        }
      })
      await fetch("http://localhost:4000/tasks/")
      .then(response => response.json()) // convierte lo viene del backend JSON en string a objecto javascript
      .then(data => {
        setTodos(data.tasks)
      })
    }
    updateTaskAndGetAllTasks()
  };

  const removeTodo = (id) => {
    async function deleteAndGetTasks(){
      await fetch(`http://localhost:4000/tasks/${id}`, { method: 'DELETE'})

      await fetch("http://localhost:4000/tasks/")
      .then(response => response.json())
      .then(data => {
        setTodos(data.tasks)
      })
    }

    deleteAndGetTasks()
  };

  const completeTodo = (id) => {
    let foundTodo;
    let updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        foundTodo = todo
        if(todo.state === 'Pending'){
          todo.state = 'Done'
        }else{
          todo.state = 'Pending'
        }
      }
      return todo;
    });

    async function updateTaskState(){
      const date = new Date()
      let requestBody = {
        state: foundTodo.state,
        lastEdit: date.toLocaleString("us")
      }
      requestBody = JSON.stringify(requestBody)

      await fetch(`http://localhost:4000/tasks/${id}`, 
      { 
        method: 'PATCH',
        body: requestBody,
        headers: {
          "Content-Type": "application/json"
        }
      }
      )
    }
    updateTaskState()

    setTodos(updatedTodos);
  };

  return (
    <>
      <h1>What's the Plan for Today?</h1>
      <TodoForm onSubmit={addTodo} />
      {todos ? (
      <Todo
        todos={todos}
        completeTodo={completeTodo}
        removeTodo={removeTodo}
        updateTodo={updateTodo}
        showDescription={showDescription}
      />) : (<div></div>)}
    </>
  );
}

export default TodoList;
