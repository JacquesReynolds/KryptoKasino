import logo from '../../images/logo.png'

const Footer = () => {
    return (
        <div className='w-full flex md:justify-center justify-between items-center flex-col p-4 gradient-bg-transactions'>
            <div className='w-full flex sm:flex-row flex-col justify-between items-center my-4'>
                <div className='flex flex-[0.5] justify-center items-center'>
                    <img src={logo} alt='logo' className='w-32' />
                </div>
                <div className='flex flex-1 justify-evenly items-center flex-wrap sm:mt-0 mt-5 w-full'>
                    <p className='text-white text-base mx-2 cursor-pointer'>Play</p>
                </div>
            </div>
            <div className='flex justify-center items-center flex-col'>
                <p className='text-white text-xl text-center'>Join Krypto Kasino</p>
                <p className='text-white text-sm text-center'>info@kryptokasino.io</p>
            </div>
        </div>
    );
}

export default Footer;