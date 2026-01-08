import React, { useState, useEffect } from 'react';
import { Plus, Layout } from 'lucide-react';
import TaskCard from '../components/UI/TaskCard';
import Modal from '../components/UI/Modal';
import DatePicker from '../components/UI/DatePicker';
import { showSuccess, showError } from '../lib/toast';

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
        showSuccess('Assignment added successfully!');
        setNewTask({ title: '', subject: '', dueDate: '' });
        setErrors({});
        setIsAddOpen(false);
      } else {
        showError('Failed to add assignment. Please try again.');
      }
    } catch (err) {
      console.error("Error adding task:", err);
      showError('Error adding assignment. Please check your connection.');
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
        showSuccess(`Task moved to ${newStatus}!`);
      } catch (err) {
        console.error("Error updating status:", err);
        showError('Failed to update task status.');
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
            showSuccess('Assignment deleted successfully!');
        } else {
            showError('Failed to delete assignment.');
        }
    } catch (err) {
        console.error("Error deleting task:", err);
        showError('Error deleting assignment.');
    }
  };

  // Helper for Error Styling
  const getInputClass = (field) => `
    w-full glass-input rounded-xl text-gray-800 dark:text-white transition-all
    ${errors[field] ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5' : 'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50'}
  `;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-1">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Assignments
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
            <span className="font-medium">Drag less, do more.</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </p>
        </div>
        <button 
            onClick={() => setIsAddOpen(true)}
            className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 active:scale-95 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40"
        >
            <Plus size={20} className="transition-transform group-hover:rotate-90 duration-300" />
            <span className="hidden md:inline font-bold">New Task</span>
        </button>
      </div>

      {/* KANBAN BOARD */}
      <div className="flex-1 overflow-x-auto pb-6 custom-scrollbar">
        <div className="flex gap-6 min-w-[800px] h-full px-4">
            
            {columns.map((col, colIndex) => (
                <div 
                  key={col} 
                  className="flex-1 min-w-[300px] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${colIndex * 100}ms` }}
                >
                    {/* Column Header */}
                    <div className="flex justify-between items-center mb-4 px-3">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2.5">
                            <span className={`relative w-3 h-3 rounded-full ${
                                col === 'To Do' ? 'bg-gray-400 shadow-md shadow-gray-400/50' : 
                                col === 'In Progress' ? 'bg-blue-500 shadow-md shadow-blue-500/50' : 'bg-green-500 shadow-md shadow-green-500/50'
                            }`}>
                              {col === 'In Progress' && (
                                <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></span>
                              )}
                            </span>
                            <span className="text-base">{col}</span>
                        </h3>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gradient-to-br from-white/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 px-3 py-1.5 rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                            {tasks.filter(t => t.status === col).length}
                        </span>
                    </div>

                    {/* Column Container */}
                    <div className="flex-1 rounded-2xl p-4 bg-gradient-to-br from-white/40 to-gray-50/40 dark:from-gray-900/40 dark:to-gray-800/40 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-y-auto custom-scrollbar">
                        {tasks
                            .filter(task => task.status === col)
                            .map((task, index) => (
                                <div 
                                  key={task._id}
                                  className="animate-in fade-in slide-in-from-left-2 duration-300"
                                  style={{ animationDelay: `${index * 50}ms` }}
                                >
                                  <TaskCard 
                                      task={task} 
                                      onMove={moveTask} 
                                      onDelete={deleteTask}
                                  />
                                </div>
                            ))
                        }
                        
                        {tasks.filter(t => t.status === col).length === 0 && (
                            <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-gray-400/60 border-2 border-dashed border-gray-300/30 dark:border-gray-600/30 rounded-xl bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-800/30 dark:to-gray-900/30">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 mb-3">
                                  <Layout size={32} className="opacity-40"/>
                                </div>
                                <span className="text-sm font-medium">No tasks here</span>
                                <span className="text-xs text-gray-400/50 mt-1">Drag a card to get started</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}

        </div>
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={isAddOpen} onClose={() => {
        setIsAddOpen(false);
        setErrors({});
        setNewTask({ title: '', subject: '', dueDate: '' });
      }} title="New Assignment">
        <form onSubmit={addTask} className="space-y-5" noValidate>
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Title
                </label>
                <input 
                    type="text" 
                    placeholder="e.g. Complete React Assignment" 
                    className={getInputClass('title')}
                    value={newTask.title}
                    onChange={e => {
                        setNewTask({...newTask, title: e.target.value});
                        setErrors({...errors, title: ''});
                    }}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1.5 ml-1 flex items-center gap-1">⚠️ {errors.title}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        Subject
                    </label>
                    <input 
                        type="text" 
                        placeholder="e.g. Computer Science" 
                        className={getInputClass('subject')}
                        value={newTask.subject}
                        onChange={e => {
                            setNewTask({...newTask, subject: e.target.value});
                            setErrors({...errors, subject: ''});
                        }}
                    />
                    {errors.subject && <p className="text-xs text-red-500 mt-1.5 ml-1 flex items-center gap-1">⚠️ {errors.subject}</p>}
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                        Due Date
                    </label>
                    <div className={`rounded-xl transition-all ${errors.dueDate ? 'border-2 border-red-500 ring-2 ring-red-500/20' : ''}`}>
                        <DatePicker 
                            value={newTask.dueDate}
                            onChange={(date) => {
                                setNewTask({...newTask, dueDate: date});
                                setErrors({...errors, dueDate: ''});
                            }}
                        />
                    </div>
                    {errors.dueDate && <p className="text-xs text-red-500 mt-1.5 ml-1 flex items-center gap-1">⚠️ {errors.dueDate}</p>}
                </div>
            </div>
            
            <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 mt-6 hover:scale-[1.02] active:scale-95 hover:shadow-xl">Add Assignment</button>
        </form>
      </Modal>

    </div>
  );
};

export default Assignments;