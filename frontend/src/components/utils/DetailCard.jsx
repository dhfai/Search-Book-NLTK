import React from 'react';
import { motion } from 'framer-motion';

export const DetailCard = ({ judul, abstrak, penulis, jmlHal, categorie, img, harga, handleCloseDetail }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                // className="relative h-screen shadow-lg overflow-y-scroll"
                className="relative h-screen shadow-lg overflow-y-scroll bg-opacity-80 bg-black"
                style={{
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                }}
            >
                <div className="flex justify-between items-center px-20 p-4">
                    <h5 className="text-xl font-semibold text-gray-300">{judul}</h5>
                    <button
                        onClick={handleCloseDetail}
                        className="text-gray-700 hover:text-gray-300"
                    >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M5.293 5.293a1 1 0 011.414 0L10 8.586l3.293-3.293a1 1 0 111.414 1.414L11.414 10l3.293 3.293a1 1 0 01-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707a1 1 0 010-1.414z"
                            />
                        </svg>
                    </button>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <img
                        className="object-cover object-center w-[150px] rounded-lg"
                        src={img}
                        alt={judul}
                    />
                    <div className="mt-4 px-20 pb-5">
                        <p className="text-gray-300 font-bold mt-2">Penulis: {penulis}</p>
                        <p className="text-gray-300 font-bold">Jumlah Halaman: {jmlHal}</p>
                        <p className="text-gray-300 font-bold">Kategori: {categorie}</p>
                        <p className="text-gray-300 mt-2 text-justify">{abstrak}</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};