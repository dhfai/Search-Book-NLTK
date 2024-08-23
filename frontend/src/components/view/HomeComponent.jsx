import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CardItem } from '../utils/CardItem';
import { BookDataFetch } from '../../service/BookDataFetch';


export const HomeComponent = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        BookDataFetch().then((res) => {
            // res.data.forEach((book) => {
            //     book.abstrak = book.abstrak.split(' ').slice(0, 20).join(' ') + '...';
            // });
            setBooks(res.data);
        });
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4 p-4"
        >
            {books && books.map((book) => (
                <CardItem
                    key={book.id}
                    id={book.id}
                    judul={book.judul}
                    abstrak={book.abstrak}
                    img={book.img}
                />
            ))}
        </motion.div>
    );
};

