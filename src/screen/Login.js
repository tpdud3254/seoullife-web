import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import * as jose from "jose";
import { gql, useMutation } from "@apollo/client";
import { useState } from "react";
import { logUserIn, setAdminVar } from "../apollo";
import { useNavigate } from "react-router-dom";

const LOGIN_MUTATION = gql`
    mutation login($email: String!) {
        login(email: $email) {
            ok
            userId
            isAdmin
        }
    }
`;

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function Login() {
    const navigate = useNavigate();
    const loginUpdate = (cache, result) => {
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
                navigate("/room");
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
        //TODOS: error 경우 추가
    };
    return (
        <div>
            <Helmet>
                <title>Login | Seoul Life</title>
            </Helmet>
            <GoogleOAuthProvider clientId={clientId}>
                <GoogleLogin onSuccess={onSuccess} onError={onError} />
            </GoogleOAuthProvider>
        </div>
    );
}

export default Login;
