import React from 'react';
import { Link } from "react-router-dom";
import {ArrowUpRightFromSquare, Search, } from 'lucide-react'
import SidebarO from './SidebarO';

export default function OrientationVids() {
  
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
          <p className='text-3xl font-serif text-black py-3'>Videos</p>
          
          <div className='mb-5 grid grid-cols-3 gap-2'>
            <div className='container w-max p-4 bg-violet-200 rounded-md mb-2'>
              <iframe className='p-4' src="https://www.youtube.com/embed/FLpn1u333U8?si=i0jHfIyQ87IIbqB0" 
              title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; 
              gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
              
              <div className='flex items-center justify-center p-4 bg-violet-100'>
                <p className='text-xl'>Fresher's Orientation week 2024</p>
                <a href='https://youtu.be/FLpn1u333U8?si=cOWYoR-KDu4w4Lpk' target='blank'><ArrowUpRightFromSquare className='m-1 w-6 h-6'/></a>
              </div>
            </div>

            <div className='container w-max p-4 bg-violet-200 rounded-md mb-2'>
              <iframe className='p-4' src="https://www.youtube.com/embed/y-S9-U8n9eY?si=9rmBxs97hRsUbloE" 
              title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; 
              gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
              
              <div className='flex items-center justify-center p-4 bg-violet-100'>
                <p className='text-xl'>Nile Hostel Offerings</p>
                <a href='https://youtu.be/y-S9-U8n9eY?si=DAuWAhehr3yaWlrx' target='blank'><ArrowUpRightFromSquare className='m-1 w-6 h-6'/></a>
              </div>
            </div>

            <div className='container w-max p-4 bg-violet-200 rounded-md mb-2'>
              <iframe className='p-4' src="https://www.youtube.com/embed/aZVKGiBWDSI?si=SwJ0FFknHTQvQjIl" 
              title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; 
              gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
              
              <div className='flex items-center justify-center p-4 bg-violet-100'>
                <p className='text-xl'>Nile Fashion Week</p>
                <a href='https://youtu.be/aZVKGiBWDSI?si=SwJ0FFknHTQvQjIl' target='blank'><ArrowUpRightFromSquare className='m-1 w-6 h-6'/></a>
              </div>
            </div>

            <div className='container w-max p-4 bg-violet-200 rounded-md mb-2'>
              <iframe className='p-4' src="https://www.youtube.com/embed/MmJc-8M4HG4?si=KBPihXWokD3pjUWg" 
              title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; 
              gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
              
              <div className='flex items-center justify-center p-4 bg-violet-100'>
                <p className='text-xl'>How to apply</p>
                <a href='https://youtu.be/MmJc-8M4HG4?si=KBPihXWokD3pjUWg' target='blank'><ArrowUpRightFromSquare className='m-1 w-6 h-6'/></a>
              </div>
            </div>

            <div className='container w-max p-4 bg-violet-200 rounded-md mb-2'>
              <iframe className='p-4' src="https://www.youtube.com/embed/FcGcgPuP844?si=-YhwLg3GLyCnVNi2" 
              title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; 
              gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
              
              <div className='flex items-center justify-center p-4 bg-violet-100'>
                <p className='text-xl'>Why Nile University?</p>
                <a href='https://youtu.be/FcGcgPuP844?si=r_bwuDgsAed5fkrF' target='blank'><ArrowUpRightFromSquare className='m-1 w-6 h-6'/></a>
              </div>
            </div>

            <div className='container w-max p-4 bg-violet-200 rounded-md mb-2'>
              <iframe className='p-4' src="https://www.youtube.com/embed/WDTaFYQugf0?si=t6WW8nvFIeAPKaT6" 
              title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; 
              gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
              
              <div className='flex items-center justify-center p-4 bg-violet-100'>
                <p className='text-xl'>Rules of the Hostel</p>
                <a href='https://youtu.be/WDTaFYQugf0?si=t6WW8nvFIeAPKaT6' target='blank'><ArrowUpRightFromSquare className='m-1 w-6 h-6'/></a>
              </div>
            </div>

            <div className='container w-max p-4 bg-violet-200 rounded-md mb-2'>
              <iframe className='p-4' src="https://www.youtube.com/embed/mWo1apygv6o?si=EHpQnTqbdCrLBuP3" 
              title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; 
              gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
              
              <div className='flex items-center justify-center p-4 bg-violet-100'>
                <p className='text-xl'>Tour of Nile University</p>
                <a href='https://youtu.be/mWo1apygv6o?si=EHpQnTqbdCrLBuP3' target='blank'><ArrowUpRightFromSquare className='m-1 w-6 h-6'/></a>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}