import React from 'react';
import { SearchInput} from "../utils/Search";


export const Navbar = () => {
    return (
        <nav
            className="border-b border-neutral-500 p-2"
            style={{ backdropBlur: '10px' }}
        >
            <div className="container mx-auto flex justify-between items-center">
                <a href='/' className="text-white font-dm font-bold">
                    E-<span className={"text-blue-500"}>SEARCH</span>
                </a>
                <SearchInput />
            </div>
        </nav>
    )
}