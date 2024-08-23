import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from '../../service/Search';
import { DetailCard } from "../utils/DetailCard";

export const SearchComponents = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const keyword = queryParams.get('keyword');

    const [searchResults, setSearchResults] = useState([]);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [correctedKeyword, setCorrectedKeyword] = useState(null);

    useEffect(() => {
        const searchHandler = async () => {
            try {
                const response = await Search(keyword);
                console.log("Respons dari backend:", response); // Debugging
    
                // Periksa apakah respons dari backend benar dan memiliki data yang sesuai
                if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    console.log("Hasil pencarian:", response.data.data); // Debugging
                    setSearchResults(response.data.data);
    
                    if (response.data.correctedKeyword && response.data.correctedKeyword !== keyword) {
                        setCorrectedKeyword(response.data.correctedKeyword);
                    } else {
                        setCorrectedKeyword(null);
                    }
                } else {
                    console.log("Tidak ada hasil yang valid dari backend.");
                    setSearchResults([]);
                    setCorrectedKeyword(null);
                }
            } catch (error) {
                console.error("Terjadi error saat mengambil data dari backend:", error);
                setSearchResults([]);
                setCorrectedKeyword(null);
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
            {correctedKeyword && (
                <div className="mb-4">
                    <p className="text-gray-700">
                        Menampilkan hasil untuk <strong>{correctedKeyword}</strong>
                    </p>
                    <p className="text-gray-500">
                        Atau telusuri <a href={`?keyword=${keyword}`} className="text-blue-500">{keyword}</a>
                    </p>
                </div>
            )}
    
            {searchResults.length > 0 ? (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                    {searchResults.map((result, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative flex w-full max-w-xs flex-col overflow-hidden rounded-lg border border-gray-100 bg-card-bg shadow-md"
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
                                    <h5 className="text-xl tracking-tight text-white">
                                        {result.judul.length > 25 ? result.judul.substring(0, 25) + '...' : result.judul}
                                    </h5>
                                </button>
                                <div className="mt-2 mb-5 flex items-center justify-between">
                                    <p className='text-black'>
                                        <span className="text-xl font-bold text-slate-900">{result.harga}</span>
                                    </p>
                                </div>
                                <button onClick={() => handleDetailClick(result)} className="flex items-center justify-center rounded-md bg-slate-900 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300">
                                    View Details
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">Tidak ada hasil pencarian yang ditemukan.</p>
            )}
            {showDetail && <DetailCard {...selectedBook} handleCloseDetail={handleCloseDetail} />}
        </motion.div>
    );    
};
