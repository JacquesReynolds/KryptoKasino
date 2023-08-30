import { HiMenuAlt4 } from 'react-icons/hi';
import { AiOutlineClose } from 'react-icons/ai';

import logo from '../../images/logo.png';
import React from 'react';
import { Link } from 'react-router-dom';

const NavbarItem = ({ title, classProps }) => {
    return (
        <Link to={`/${title.toLowerCase()}`}>
            <li className={`mx-4 cursor-pointer ${classProps}`}>
                {title}
            </li>
        </Link>
    );
}


const Navbar = () => {

    const [toggleMenu, setToggleMenu] = React.useState(false);

    return (
        <nav className='w-full flex md:justify-center justify-between items-center p-4'>
            <Link to="/">
                <img src={logo} alt="logo" className='w-32 cursor-pointer' />
            </Link>
            <ul className='text-white md:flex hidden list-none flex-row justify-between items-center flex-initial'>
                {["Play"].map((item, index) => (
                    <NavbarItem key={item + index} title={item} />
                ))}
            </ul>
            <div className='flex relative'>
                {toggleMenu
                    ? <AiOutlineClose fontSize={28} className='text-white md:hidden cursor-pointer' onClick={() => setToggleMenu(false)} />
                    : <HiMenuAlt4 fontSize={28} className='text-white md:hidden cursor-pointer' onClick={() => setToggleMenu(true)} />
                }
                {toggleMenu && (
                    <ul
                        className='z-10 fixed top-0 -right-2 p-3 w-[70vw] h-screen shadow-2xl md:hidden list-none
                        flex flex-col justify-start items-end rounded-md blue-glassmorphism text-white animate-slide-in'
                    >
                        <li className='text-xl w-full my-2'>
                            <AiOutlineClose onClick={() => setToggleMenu(false)} />
                        </li>
                        {["Play"].map((item, index) => (
                            <NavbarItem key={item + index} title={item} classProps='my-2 text-lg text-white' />
                        ))}
                    </ul>
                )}
            </div>
        </nav>
    );
}

export default Navbar;