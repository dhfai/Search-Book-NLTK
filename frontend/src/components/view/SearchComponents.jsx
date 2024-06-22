import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from '../../service/Search';
import {DetailCard} from "../utils/DetailCard";

export const SearchComponents = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const keyword = queryParams.get('keyword');

    const [searchResults, setSearchResults] = useState([]);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    useEffect(() => {
        const searchHandler = async () => {
            try {
                const response = await Search(keyword);
                setSearchResults(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        searchHandler();
    }, [keyword]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setShowDetail(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleDetailClick = (book) => {
        setSelectedBook(book);
        setShowDetail(true);
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto mt-8"
        >
            <div
                // className="grid grid-cols-4 gap-4"
                // responsive design
                className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4"
            >
                {searchResults && searchResults.map((result, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative flex w-full max-w-xs flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md"
                    >
                        <button onClick={() => handleDetailClick(result)} className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl">
                            <motion.img
                                whileHover={{ scale: 1.05 }}
                                className="object-cover object-center w-full h-full rounded-xl"
                                src={result.img}
                                alt={result.judul}
                            />
                        </button>
                        <div className="mt-4 px-5 pb-5">
                            <button onClick={() => handleDetailClick(result)}>
                                <h5 className="text-xl tracking-tight text-slate-900">
                                    {result.judul.length > 25 ? result.judul.substring(0, 25) + '...' : result.judul}
                                </h5>
                            </button>
                            <div className="mt-2 mb-5 flex items-center justify-between">
                                <p className='text-black'>
                                    <span className="text-xl font-bold text-slate-900">{result.harga}</span>
                                </p>
                                <div className="flex items-center">
                                    <svg aria-hidden="true" className="h-5 w-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"></svg>
                                    <span className="mr-2 ml-3 rounded bg-yellow-200 px-2.5 py-0.5 text-xs font-semibold">5.0</span>
                                </div>
                            </div>
                            <button onClick={() => handleDetailClick(result)} className="flex items-center justify-center rounded-md bg-slate-900 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300">
                                View Details
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
            {
                showDetail && <DetailCard {...selectedBook} handleCloseDetail={handleCloseDetail} />
            }
        </motion.div>
    );
};
