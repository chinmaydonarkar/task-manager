import React, { useState, useRef, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';

export default function TaskForm({ task = null, isEditing = false, onSuccess }) {
  const { createTask, updateTask } = useTaskContext();
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'Pending');
  const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Update form fields when task prop changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'Pending');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    }
  }, [task]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('Pending');
    setDueDate('');
    setFiles([]);
    setError('');
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!title.trim()) {
      setError('Task title required');
      return;
    }

    try {
      setUploading(true);
      console.log('Creating task with data:', { title, description, status, dueDate, filesCount: files.length });
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('status', status);
      if (dueDate) {
        formData.append('dueDate', dueDate);
      }
      
      // Add files to formData
      files.forEach(file => {
        formData.append('files', file);
      });

      if (isEditing) {
        console.log('Updating task:', task._id);
        await updateTask(task._id, formData);
        console.log('Task updated successfully');
        setSuccess(true);
      } else {
        console.log('Creating new task...');
        await createTask(formData);
        console.log('Task created successfully');
        setSuccess(true);
        // Reset form only for new task creation
        resetForm();
      }
      
      console.log('Task form submission completed');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error in task form submission:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg'];
      
      if (file.size > maxSize) {
        setError('File size must be less than 10MB');
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF, DOCX, JPG files are allowed');
        return false;
      }
      
      return true;
    });
    
    setFiles(validFiles);
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Task description"
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.jpg,.jpeg"
          onChange={handleFileChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <p className="text-xs text-gray-500 mt-1">PDF, DOCX, JPG files only. Max 10MB per file.</p>
      </div>

      {files.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selected Files:</label>
          <ul className="text-sm text-gray-600">
            {files.map((file, index) => (
              <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-4">
        <button 
          type="submit" 
          disabled={uploading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {uploading ? 'Saving...' : (isEditing ? 'Update Task' : 'Create Task')}
        </button>
        {error && <div className="text-red-500 font-medium">{error}</div>}
        {success && (
          <div className="text-green-500 font-medium">Task {isEditing ? 'updated' : 'created'} successfully!</div>
        )}
      </div>
    </form>
  );
}
