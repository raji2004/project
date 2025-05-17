import React from 'react';
import SidebarR from './SidebarR';
import {Search, ArrowRight} from 'lucide-react'

export default function ResourcesPQ() {
  
  return (
    <div className='container flex flex-wrap'>
      <SidebarR/>

      <div className='container m-auto pb-2 bg-violet-800 md:relative left-28'>
        <div className='sticky top-0'>
          <div className='p-3.5 bg-violet-300 w-full flex items-center'>
            <input type='text' placeholder='Search' className='mx-2 p-2 w-1/2 xl:w-4/5'/>
            <Search className='w-10 h-10'/>
          </div>
        </div>

        <div className='mx-8 my-2'>
          <p className='text-3xl font-serif text-black py-3'>Orientation Checklist</p>
          
          <div className='mb-5'>
            <div className='container w-full p-4 grid grid-cols-2 bg-white rounded-md mb-2'>
              <p className='text-xl col-start-1'><b>Step 1:</b> About the Campus</p>
              <ArrowRight className='col-start-3'/>
            </div>
            <div className='container w-full p-4 grid grid-cols-2 bg-white rounded-md mb-2'>
              <p className='text-xl col-start-1'><b>Step 2:</b> How to Use Student Portals</p>
              <ArrowRight className='col-start-3'/>
            </div>
            <div className='container w-full p-4 grid grid-cols-2 bg-white rounded-md mb-2'>
              <p className='text-xl col-start-1'><b>Step 3:</b> Key Departments</p>
              <ArrowRight className='col-start-3'/>
            </div>
            <div className='container w-full p-4 grid grid-cols-2 bg-white rounded-md mb-2'>
              <p className='text-xl col-start-1 col-start-1'><b>Step 4:</b> Clubs and Activities</p>
              <ArrowRight className='col-start-3'/>
            </div>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 mb-4'>
            <div className='grid grid-cols-1'>
              
              <a href="https://maps.app.goo.gl/UWHkQKM98SDzYCA8A" target='blank'>
                <div className='container w-max p-4 mb-3 rounded-md bg-violet-300 col-span-2'>
                  <p>Open Campus Map</p>
                </div>
              </a>
              <div>
                <div className='container w-max p-4 mb-3 rounded-md bg-violet-300 col-span-2'>
                  <p>View Student Email</p>
                </div>
              </div>

            </div>
            <div className='container p-4 mb-3 rounded-md bg-violet-300'>
              <p className='text-lg'><b>Did you know?</b></p>
              <p className='overflow-auto'>Did you know that Nile University of Nigeria is affiliated with Honoris which makes it
                member of a large, pan-African private higher education network. This membership provides
                Nile University with access to resources, networks, and opportunities within the Honoris system,
                ultimately enhancing the university's ability to fulfill its mission of providing a globalized
                education.</p>
            </div>
          </div>

          <div className='mb-5 bg-violet-200 p-4'>
            <p id='FAQs' className='text-4xl mb-5'>Frequently Asked Questions</p>
            <div className='container w-full p-4 grid grid-cols-2 bg-white rounded-md mb-2'>
              <p className='text-xl col-start-1'>Where do my results show?</p>
            </div>
            <div className='container w-full p-4 grid grid-cols-2 bg-white rounded-md mb-2'>
              <p className='text-xl col-start-1'>How do I get notes?</p>
            </div>
            <div className='container w-full p-4 grid grid-cols-2 bg-white rounded-md mb-2'>
              <p className='text-xl col-start-1'>Where do we take classes?</p>
            </div>
            <div className='container w-full p-4 grid grid-cols-2 bg-white rounded-md mb-2'>
              <p className='text-xl col-start-1 col-start-1'>Still don't get it?</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}