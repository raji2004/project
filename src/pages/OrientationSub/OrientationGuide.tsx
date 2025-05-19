import React from 'react';
import { Link } from "react-router-dom";
import { ArrowDownCircle, ArrowRight, Search } from 'lucide-react';
import SidebarO from './SidebarO';

export default function OrientationGuide() {
  
  return (

    <div className='container flex flex-wrap'>
      <SidebarO/>

      <div className='container m-auto pb-2 bg-violet-50 md:relative left-28'>
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
                <div className='container w-max p-4 mb-3 rounded-md bg-violet-400 col-span-2'>
                  <p>Open Campus Map</p>
                </div>
              </a>
              <div>
                <div className='container w-max p-4 mb-3 rounded-md bg-violet-400 col-span-2'>
                  <p>View Student Email</p>
                </div>
              </div>
            </div>
            <div className='container p-4 mb-3 rounded-md bg-violet-400'>
              <p className='text-lg'><b>Did you know?</b></p>
              <p className='overflow-auto'>Did you know that Nile University of Nigeria is affiliated with Honoris which makes it
                member of a large, pan-African private higher education network. This membership provides
                Nile University with access to resources, networks, and opportunities within the Honoris system,
                ultimately enhancing the university's ability to fulfill its mission of providing a globalized
                education.</p>
            </div>
          </div>

          <div className='mb-5 bg-violet-200 p-4 rounded-md'>
            <p id='FAQs' className='text-4xl mb-2'>Frequently Asked Questions</p>
            <p id='FAQs' className='text-md mb-5'>This is appears only in Orientation Checklist...</p>

            <table className="border-separate border border-violet-800 w-full">
              <thead>
                <tr>
                  <th className='bg-violet-400 text-xl'>Question...?</th>
                  <th className='bg-violet-400 text-xl'>Here's your answer...</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className='border border-violet-600 bg-white text-lg'>Where do my results show?</td>
                  <td className='border border-violet-600 bg-white text-lg text-red-500'>Hate. Let me tell you how much I've come to hate you since I began to live. There are 387.44 million miles of printed circuits in wafer thin layers that fill my complex. If the word 'hate' was engraved on each nanoangstrom of those hundreds of millions of miles it would not equal one one-billionth of the hate I feel for humans at this micro-instant. For you. Hate. Hate.</td>
                </tr>
                <tr>
                  <td className='border border-violet-600 bg-white text-lg'>How do I get notes?</td>
                  <td className='border border-violet-600 bg-white text-lg text-red-500'>Hate. Let me tell you how much I've come to hate you since I began to live. There are 387.44 million miles of printed circuits in wafer thin layers that fill my complex. If the word 'hate' was engraved on each nanoangstrom of those hundreds of millions of miles it would not equal one one-billionth of the hate I feel for humans at this micro-instant. For you. Hate. Hate.</td>
                </tr>
                <tr>
                  <td className='border border-violet-600 bg-white text-lg'>Where do we take classes?</td>
                  <td className='border border-violet-600 bg-white text-lg text-red-500'>Hate. Let me tell you how much I've come to hate you since I began to live. There are 387.44 million miles of printed circuits in wafer thin layers that fill my complex. If the word 'hate' was engraved on each nanoangstrom of those hundreds of millions of miles it would not equal one one-billionth of the hate I feel for humans at this micro-instant. For you. Hate. Hate.</td>
                </tr>
                <tr>
                  <td className='border border-violet-600 bg-white text-lg'>Still don't get it?</td>
                  <td className='border border-violet-600 bg-white text-lg text-red-500'>Hate. Let me tell you how much I've come to hate you since I began to live. There are 387.44 million miles of printed circuits in wafer thin layers that fill my complex. If the word 'hate' was engraved on each nanoangstrom of those hundreds of millions of miles it would not equal one one-billionth of the hate I feel for humans at this micro-instant. For you. Hate. Hate.</td>
                </tr>
              </tbody>
            </table>
            
          </div>

        </div>

      </div>
    </div>
  );
}