import React, { useState, useEffect } from 'react';
import { Plus, Layout } from 'lucide-react';
import TaskCard from '../components/UI/TaskCard';
import Modal from '../components/UI/Modal';
import DatePicker from '../components/UI/DatePicker';

const Assignments = () => {
  const [tasks, setTasks] = useState([]); // Empty initially
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', subject: '', dueDate: '' });
  const [errors, setErrors] = useState({});

  // 1. FETCH TASKS ON LOAD
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from login
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/assignments`, {
          headers: { 'x-auth-token': token }
        });
        const data = await res.json();
        if (res.ok) {
          setTasks(data);
        } else {
          console.error("Failed to fetch:", data);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    fetchTasks();
  }, []);

  const columns = ['To Do', 'In Progress', 'Done'];

  // 2. ADD TASK (Connected to DB)
  const addTask = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!newTask.title.trim()) newErrors.title = "Title is required";
    if (!newTask.subject.trim()) newErrors.subject = "Subject is required";
    if (!newTask.dueDate) newErrors.dueDate = "Due date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/assignments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify(newTask)
      });
      
      const savedTask = await res.json();
      
      if (res.ok) {
        setTasks([savedTask, ...tasks]); // Add real DB task to UI
        setNewTask({ title: '', subject: '', dueDate: '' });
        setErrors({});
        setIsAddOpen(false);
      }
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  // 3. MOVE TASK (Connected to DB)
  const moveTask = async (id, direction) => {
    // Find the task locally first to determine new status
    const taskToUpdate = tasks.find(t => t._id === id); // MongoDB uses _id
    if (!taskToUpdate) return;

    const currentIndex = columns.indexOf(taskToUpdate.status);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < columns.length) {
      const newStatus = columns[newIndex];

      try {
        // Optimistic UI Update (Update UI instantly)
        const updatedTasks = tasks.map(t => 
             t._id === id ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);

        // Send to Backend
        const token = localStorage.getItem('token');
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/assignments/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': token 
            },
            body: JSON.stringify({ status: newStatus })
        });
      } catch (err) {
        console.error("Error updating status:", err);
        // Optional: Revert UI if error occurs
      }
    }
  };

  // 4. DELETE TASK (Connected to DB)
  const deleteTask = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/assignments/${id}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });

        if (res.ok) {
            setTasks(tasks.filter(t => t._id !== id));
        }
    } catch (err) {
        console.error("Error deleting task:", err);
    }
  };

  // Helper for Error Styling
  const getInputClass = (field) => `
    w-full glass-input rounded-xl text-gray-800 dark:text-white transition-all
    ${errors[field] ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5' : ''}
  `;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-1">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Assignments
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Drag less, do more.</p>
        </div>
        <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
        >
            <Plus size={18} /> <span className="hidden md:inline">New Task</span>
        </button>
      </div>

      {/* KANBAN BOARD */}
      <div className="flex-1 overflow-x-auto pb-6 custom-scrollbar">
        <div className="flex gap-6 min-w-[800px] h-full px-4">
            
            {columns.map((col) => (
                <div key={col} className="flex-1 min-w-[300px] flex flex-col">
                    {/* Column Header */}
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${
                                col === 'To Do' ? 'bg-gray-400' : 
                                col === 'In Progress' ? 'bg-blue-500' : 'bg-green-500'
                            }`} />
                            {col}
                        </h3>
                        <span className="text-xs font-mono text-gray-400 bg-white/50 dark:bg-black/50 px-2 py-1 rounded-lg">
                            {tasks.filter(t => t.status === col).length}
                        </span>
                    </div>

                    {/* Column Container */}
                    <div className="flex-1 rounded-2xl p-4 bg-white/30 dark:bg-gray-900/30 border-0 shadow-lg shadow-blue-900/5 overflow-y-auto custom-scrollbar">
                        {tasks
                            .filter(task => task.status === col)
                            .map(task => (
                                <TaskCard 
                                    key={task._id} // MongoDB uses _id, not id
                                    task={task} 
                                    onMove={moveTask} 
                                    onDelete={deleteTask}
                                />
                            ))
                        }
                        
                        {tasks.filter(t => t.status === col).length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400/50 border-2 border-dashed border-gray-400/20 rounded-xl">
                                <Layout size={32} className="mb-2 opacity-50"/>
                                <span className="text-sm">No tasks</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}

        </div>
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="New Assignment">
        <form onSubmit={addTask} className="space-y-4" noValidate>
            <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Title</label>
                <input 
                    type="text" 
                    placeholder="e.g. History Essay" 
                    className={getInputClass('title')}
                    value={newTask.title}
                    onChange={e => {
                        setNewTask({...newTask, title: e.target.value});
                        setErrors({...errors, title: ''});
                    }}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1 ml-1">{errors.title}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Subject</label>
                    <input 
                        type="text" 
                        placeholder="e.g. History" 
                        className={getInputClass('subject')}
                        value={newTask.subject}
                        onChange={e => {
                            setNewTask({...newTask, subject: e.target.value});
                            setErrors({...errors, subject: ''});
                        }}
                    />
                    {errors.subject && <p className="text-xs text-red-500 mt-1 ml-1">{errors.subject}</p>}
                </div>
                <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Due Date</label>
                    <div className={`rounded-xl transition-all ${errors.dueDate ? 'border border-red-500 ring-2 ring-red-500/20' : ''}`}>
                        <DatePicker 
                            value={newTask.dueDate}
                            onChange={(date) => {
                                setNewTask({...newTask, dueDate: date});
                                setErrors({...errors, dueDate: ''});
                            }}
                        />
                        
                    </div>
                    {errors.dueDate && <p className="text-xs text-red-500 mt-1 ml-1">{errors.dueDate}</p>}
                </div>
            </div>
            
            <button type="submit" className="w-full glass-btn mt-4 rounded-xl">Add Assignment</button>
        </form>
      </Modal>

    </div>
  );
};

export default Assignments;