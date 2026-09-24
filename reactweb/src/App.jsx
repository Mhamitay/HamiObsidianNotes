import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'task-list.v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function Tick() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6.2 5 8.6 9.5 3.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function App() {
  const [todos, setTodos] = useState(load)
  const [input, setInput] = useState('')
  const [leaving, setLeaving] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  useLayoutEffect(() => {
    inputRef.current?.focus()
  }, [])

  const rows = useMemo(() => [...todos.filter((t) => !t.done), ...todos.filter((t) => t.done)], [todos])
  const done = todos.filter((t) => t.done).length
  const total = todos.length
  const pct = total ? Math.round((done / total) * 100) : 0

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const addTodo = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setTodos([...todos, { id: Date.now(), text, done: false }])
    setInput('')
    inputRef.current?.focus()
  }

  const toggleTodo = (id) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  const removeTodo = (id) => {
    setLeaving(id)
    window.setTimeout(() => {
      setTodos(todos.filter((t) => t.id !== id))
      setLeaving(null)
    }, 160)
  }

  return (
    <div className="page">
      <header className="masthead">
        <div>
          <h1>Today&rsquo;s list</h1>
          <p className="today">{today}</p>
        </div>
        {total > 0 && (
          <p className="progress" aria-live="polite">
            {done} of {total} done
          </p>
        )}
      </header>

      <form className="add" onSubmit={addTodo}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          placeholder="Add a task and press Enter"
          onChange={(e) => setInput(e.target.value)}
          aria-label="New task"
        />
        <button type="submit">Add</button>
      </form>

      {total === 0 ? (
        <div className="empty">
          <p className="blank">Nothing on the list yet</p>
          <span className="rule" aria-hidden="true"></span>
          <p className="hint">Type a task above and it will wait here until you finish it.</p>
        </div>
      ) : (
        <ul className="tasks">
          <li className="rail" aria-hidden="true">
            <span className="rail-track"></span>
            <span className="rail-fill" style={{ '--fill': `${pct}%` }}></span>
          </li>
          {rows.map((todo) => (
            <li key={todo.id} className={`task${todo.done ? ' is-done' : ''}${leaving === todo.id ? ' leaving' : ''}`}>
              <button
                className="mark"
                aria-pressed={todo.done}
                aria-label={todo.done ? `Mark "${todo.text}" as not done` : `Mark "${todo.text}" as done`}
                onClick={() => toggleTodo(todo.id)}
              >
                <Tick />
              </button>
              <span className="text">{todo.text}</span>
              <button className="del" onClick={() => removeTodo(todo.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App