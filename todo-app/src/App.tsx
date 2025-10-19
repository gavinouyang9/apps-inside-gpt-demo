import { useState, useEffect } from 'react';
import './App.css';
import { TodoForm } from './components/TodoForm';
import { TodoItem } from './components/TodoItem';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = 'todos';

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).filter((todo: Todo) => !todo.completed) : [];
  });
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim() === '') return;
    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: inputValue,
        completed: false,
      },
    ]);
    setInputValue('');
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="App">
      <h1>Todo List</h1>
      <div className="todo-container">
        <TodoForm
          inputValue={inputValue}
          setInputValue={setInputValue}
          addTodo={addTodo}
        />
        <div className="todo-list">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              toggleTodo={toggleTodo}
              deleteTodo={deleteTodo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;