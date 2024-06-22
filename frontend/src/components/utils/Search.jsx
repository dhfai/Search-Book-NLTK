import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const SearchInput = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (searchTerm.trim() !== '') {
            navigate(`/search?keyword=${searchTerm}`);
        }
    };

    const buttonClickSlider = {
        initial: { x: 0 },
        animate: { x: 10 },
        transition: { type: 'spring', stiffness: 100, damping: 0 },
    };

    const [showInput, setShowInput] = useState(false);

    const handleShowInput = () => {
        setShowInput(!showInput);
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center border border-neutral-500 rounded-md">
            <button onClick={handleShowInput} type="button" className="p-2">
                <motion.span
                    variants={buttonClickSlider}
                    whileHover="animate"
                    whileTap="initial"
                >
                    <SearchIcon className='text-white' size="24"/>
                </motion.span>
            </button>
            <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: showInput ? 1 : 0, width: showInput ? 'auto' : 0 }}
                transition={{ type: 'spring', stiffness: 50, damping: 10 }}
                style={{ overflow: 'hidden' }}
            >
                <motion.input
                    initial={{ x: -50 }}
                    animate={{ x: showInput ? 0 : -50 }}
                    transition={{ type: 'spring', stiffness: 50, damping: 5 }}
                    onChange={handleChange}
                    value={searchTerm}
                    type="text"
                    placeholder="Search..."
                    className="p-2 focus:outline-none rounded bg-transparent text-white w-48"
                />
            </motion.div>
        </form>
    );
};
