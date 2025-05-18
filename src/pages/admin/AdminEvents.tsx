import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddEvent = ({ onAddEvent }) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && start && end) {
      const newEvent = {
        title,
        start,
        end,
        allDay: false,
      };
      onAddEvent(newEvent,  alert("The Event has been Added!")); // This function would be passed down from the parent
      navigate('./pages/Schedule'); // Navigate back to the schedule page after adding
    } else {
      alert('Please fill in all the fields.');
    }
  };

  return (
    <div className='container m-auto p-3 font-serif w-full max-w-md rounded-lg shadow-lg bg-violet-100'>
      <p className='text-2xl p-2 mb-4'>Add New Event</p>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label htmlFor='title' className='block text-gray-700 text-sm font-bold mb-2'>
            Title:
          </label>
          <input
            type='text'
            id='title'
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor='start' className='block text-gray-700 text-sm font-bold mb-2'>
            Start Date and Time:
          </label>
          <input
            type='datetime-local'
            id='start'
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor='end' className='block text-gray-700 text-sm font-bold mb-2'>
            End Date and Time:
          </label>
          <input
            type='datetime-local'
            id='end'
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        <div className='flex items-center justify-between'>
          <button
            type='submit'
            className='bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
          >
            Add Event
          </button>
          <button
            type='button'
            className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
            onClick={() => navigate('/Schedule')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEvent;