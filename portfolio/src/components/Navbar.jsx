import React from 'react'

const Navbar = () => {
  return (
    <>
    <nav className="bg-blue-500 p-4 text-white flex flex-row justify-between items-center font-semibold">
      <h1 className='text-3xl tracking-widest'>pouras</h1>
      <div className='flex flex-row justify-between items-center gap-8 text-lg hover:cursor-pointer'>
        <a>About</a>
        <a>Contact</a>
        <a>Skills</a>
        <a>Projects</a>
      </div>
    </nav>
    </>
  )
}

export default Navbar