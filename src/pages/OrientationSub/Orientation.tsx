import React from 'react';
import { Link } from "react-router-dom";

export default function Orientation() {
  
  return (
    <div className='shadow-lg bg-violet-200 p-8 grid md:grid-cols-2'>
      <div className='container justify-start col'>
        <div className='container w-auto mb-4'>
          <div className='font-serif text-6xl text-black font-medium'>Welcome to <br/> Nile University <br/> Orientation Portal</div>
        </div>
        <div className='container w-auto mb-4'>
          <div className='font-serif text-2xl text-black'>Start your journey with our <br/> university guides and videos.</div>
        </div>
        <div className='mb-6'>
          <Link to="/OrientationGuide">
            <button className='px-8 py-2.5 mr-2 bg-violet-400 text-white font-serif rounded-md'>Get Started</button>
          </Link>
          <Link to="/OrientationVids">
            <button className='px-6 py-2 bg-white text-black font-serif rounded-md ring-2 ring-black'>Watch Intro Video</button>
          </Link>
        </div>
      </div>
     
      <div className='col'>
        <img src="src/images/HomeOriPic.svg" alt="..." className="w-[701px] h-[525px]"></img>
      </div>
    </div>
  );
}