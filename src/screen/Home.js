import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import Map from "../component/Map";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { gql, useLazyQuery, useReactiveVar } from "@apollo/client";
import { isAdminVar, isLoggedInVar } from "../apollo";

const Container = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
    align-items: center;
    margin-top: 50px;
`;

const Warrper = styled.div``;

const ButtonContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    align-items: center;
    margin-top: 50px;
`;

const Button = styled.div`
    margin-bottom: 20px;
    background-color: tomato;
    color: white;
    padding: 10px 15px;
    border-radius: 10px;
    &:hover {
        opacity: 0.5;
    }
`;

const FIND_ROOM = gql`
    query findRoom($id: Int!) {
        findRoom(id: $id) {
            roomId
        }
    }
`;

const callNumber = process.env.REACT_APP_CALL_NUMBER;

function Home() {
    const isLoggedIn = useReactiveVar(isLoggedInVar);
    const isAdmin = useReactiveVar(isAdminVar);
    const navigate = useNavigate();
    const [startQueryFn] = useLazyQuery(FIND_ROOM);

    const goToLogin = () => {
        navigate("/login");
    };

    const goToRooms = () => {
        navigate("/rooms");
    };

    const goToRoom = () => {
        startQueryFn({
            variables: { id: isLoggedIn },
        }).then((result) => {
            console.log(result?.data?.findRoom?.roomId);
            navigate("/room", {
                state: { roomId: result?.data?.findRoom?.roomId },
            });
        });
    };

    return (
        <Container>
            <Helmet>
                <title>Home | Seoul Life</title>
            </Helmet>
            <Warrper>
                <Map />
                <ButtonContainer>
                    <Button>
                        <a href={`tel:${callNumber}`}>Call</a>
                    </Button>
                    <Button
                        onClick={
                            isLoggedIn
                                ? isAdmin
                                    ? goToRooms
                                    : goToRoom
                                : goToLogin
                        }
                    >
                        Message
                    </Button>
                </ButtonContainer>
            </Warrper>
        </Container>
    );
}

export default Home;
