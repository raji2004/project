import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

/*Added {events} to Schedule()*/
export default function Schedule({events}) {
  return (
    <div className='container m-auto p-3 font-serif w-full h-full rounded-lg shadow-lg bg-violet-100'>
      <p className='text-4xl p-2'>Schedule</p>

      <div className='container m-auto p-3 w-11/12 bg-violet-50 shadow'>
        
        <FullCalendar
          plugins={[dayGridPlugin,timeGridPlugin,interactionPlugin]}
          initialView={'timeGridWeek'}
          headerToolbar={{
            start: 'dayGridMonth, timeGridWeek, timeGridDay',
            center: 'title',
            end: 'today prev,next'
          }}
          events={events} //The events popup. Should be linked to the database
        />

      </div>
    </div>
  )
}
