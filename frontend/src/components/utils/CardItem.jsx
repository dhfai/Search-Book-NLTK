import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {DetailCard} from "./DetailCard";

export const CardItem = ({ judul, abstrak, img }) => {
    const [showDetail, setShowDetail] = useState(false);

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

    const handleDetailClick = () => {
        setShowDetail(!showDetail);
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
    };


    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                // className="relative flex w-full max-w-xs flex-col overflow-hidden rounded-lg border border-neutral-500 bg-card-bg shadow-md"
                // responsive design
                className="relative flex w-full max-w-xs flex-col overflow-hidden rounded-lg border border-neutral-500 bg-card-bg shadow-md"
            >
                <button onClick={handleDetailClick} className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl">
                    <motion.img
                        whileHover={{ scale: 1.05 }}
                        className="object-cover object-center w-full h-full rounded-xl"
                        src={img}
                        alt={judul}
                    />
                </button>
                <div className="mt-4 px-5 pb-5">
                    <button onClick={handleDetailClick}>
                        <h5 className="text-xl tracking-tight text-gray-200">
                            {
                                judul.length > 25 ? judul.substring(0, 25) + '...' : judul
                            }
                        </h5>
                    </button>
                    <button
                        onClick={handleDetailClick}
                        className="flex items-center justify-center rounded-md  px-5 py-2.5 text-center text-sm font-medium text-slate-900 hover:text-white bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
                    >
                        View Details
                    </button>
                </div>
            </motion.div>

            {
                showDetail && <DetailCard {...{ judul, abstrak, img, handleCloseDetail }} />
            }
        </>
    );
};
