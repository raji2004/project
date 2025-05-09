import React from 'react';

export default function Resources() {
  
  return (
    <div className='shadow-lg bg-white p-8 grid md:grid-cols-2'>
      <div className='container justify-start col'>
        <div className='container w-auto mb-6'>
          <div className='font-serif text-6xl text-black font-medium'>Welcome to <br/> the Resource <br/> Library</div>
        </div>
        <div className='container w-auto mb-6'>
          <div className='font-serif text-2xl text-black'>Find the study materials to help <br/> you succeed in your courses.</div>
        </div>
        <div className='mb-6'>
          <button className='px-12 py-2.5 mr-2 bg-black text-white font-serif rounded-md'>Browse Resources</button>
        </div>
      </div>
     
      <div className='col'>
        <img src="src/images/Library-amico1.svg" alt="..." className="w-[701px] h-[525px] bg-white"></img>
      </div>
    </div>
  );
}