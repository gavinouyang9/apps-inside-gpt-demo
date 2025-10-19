import { FormEvent } from 'react';

interface TodoFormProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  addTodo: () => void;
}

export function TodoForm({ inputValue, setInputValue, addTodo }: TodoFormProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    addTodo();
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Add a new task..."
      />
      <button type="submit">Add</button>
    </form>
  );
}