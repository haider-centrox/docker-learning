'use client';

import { useState, useEffect } from 'react';
import { api, Task } from '@/lib/api';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setError(null);
      await api.createTask({
        ...formData,
        status: 'todo',
      });
      setFormData({ title: '', description: '', priority: 'medium', dueDate: '' });
      fetchTasks();
    } catch (err) {
      setError('Failed to create task.');
      console.error(err);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      setError(null);
      const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
      await api.updateTask(id, { status: newStatus });
      fetchTasks();
    } catch (err) {
      setError('Failed to update task.');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await api.deleteTask(id);
      fetchTasks();
    } catch (err) {
      setError('Failed to delete task.');
      console.error(err);
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'priority-low';
      case 'high':
        return 'priority-high';
      default:
        return 'priority-medium';
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Task Manager</h1>
        <p>Manage your tasks efficiently</p>
      </div>

      {error && <div className="error">{error}</div>}

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter task title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter task description"
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Add Task
        </button>
      </form>

      <div className="task-list">
        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty">
            <p>No tasks yet. Create your first task above!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
              <div className="task-info">
                <h3 className="task-title">{task.title}</h3>
                {task.description && <p className="task-description">{task.description}</p>}
                <div className="task-meta">
                  <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                    {task.priority}
                  </span>
                  {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                  <span>{task.status === 'completed' ? 'Completed' : 'Pending'}</span>
                </div>
              </div>
              <div className="task-actions">
                <button
                  onClick={() => task._id && handleToggleStatus(task._id, task.status)}
                  className={`btn ${task.status === 'completed' ? 'btn-primary' : 'btn-success'}`}
                >
                  {task.status === 'completed' ? 'Undo' : 'Complete'}
                </button>
                <button
                  onClick={() => task._id && handleDelete(task._id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
