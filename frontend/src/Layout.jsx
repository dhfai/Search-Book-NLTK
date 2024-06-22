import React from 'react';
import {Container} from "./components/Container/Container";
import {Header} from "./components/Header";

export const Layout = ({children}) => {
    return (
        <Container>
            <Header />
            {children}
        </Container>
    )
}