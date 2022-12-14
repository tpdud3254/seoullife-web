import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import * as jose from "jose";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { logUserIn, setAdminVar } from "../apollo";
import { useNavigate } from "react-router-dom";
const clientAccount = require("../client_secret.json");

const LOGIN_MUTATION = gql`
    mutation login($email: String!) {
        login(email: $email) {
            ok
            userId
            isAdmin
        }
    }
`;

const FIND_ROOM = gql`
    query findRoom($id: Int!) {
        findRoom(id: $id) {
            roomId
        }
    }
`;

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px;
`;
const Wrapper = styled.div`
    background-color: white;
    padding: 20px 40px;
    border-radius: 15px;
`;

const clientId = clientAccount["web"]["client_id"];

function Login() {
    const navigate = useNavigate();
    const [startQueryFn] = useLazyQuery(FIND_ROOM);

    const loginUpdate = async (cache, result) => {
        const {
            data: {
                login: { ok, userId, isAdmin },
            },
        } = result;
        if (ok) {
            logUserIn(userId);
            setAdminVar(isAdmin);

            if (isAdmin) {
                navigate("/rooms");
            } else {
                startQueryFn({
                    variables: { id: userId },
                }).then((result) => {
                    navigate("/room", {
                        state: { roomId: result?.data?.findRoom?.roomId },
                    });
                });
            }
        }
    };
    const [loginMutation] = useMutation(LOGIN_MUTATION, {
        update: loginUpdate,
    });

    const onSuccess = (credentialResponse) => {
        const token = credentialResponse.credential;
        const { email } = jose.decodeJwt(token);

        loginMutation({
            variables: {
                email,
            },
        });
    };

    const onError = () => {
        //TODOS: error ?????? ??????
    };
    return (
        <Container>
            <Helmet>
                <title>Login | Seoul Life</title>
            </Helmet>
            <Wrapper>
                <GoogleOAuthProvider clientId={clientId}>
                    <GoogleLogin onSuccess={onSuccess} onError={onError} />
                </GoogleOAuthProvider>
            </Wrapper>
        </Container>
    );
}

export default Login;
