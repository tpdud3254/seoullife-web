import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { GlobalStyles } from "./styles";
import Home from "./screen/Home";
import Login from "./screen/Login";
import { ApolloProvider } from "@apollo/client";
import { client } from "./apollo";
import Rooms from "./screen/Rooms";
import Room from "./screen/Room";

function App() {
    return (
        <ApolloProvider client={client}>
            <HelmetProvider>
                <GlobalStyles />
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />}></Route>
                        <Route path="/login" element={<Login />}></Route>
                        <Route path="/room" element={<Room />}></Route>
                        <Route path="/rooms" element={<Rooms />}></Route>
                    </Routes>
                </Router>
            </HelmetProvider>
        </ApolloProvider>
    );
}

export default App;
