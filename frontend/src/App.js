import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import {Layout} from "./Layout";
import {Home} from "./pages/Home";
import {SearchPage} from "./pages/SearchPage";


function App() {
  return (
    <Router>
        <Layout>
            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/search" element={<SearchPage />} />
            </Routes>
        </Layout>
    </Router>
  );
}

export default App;
