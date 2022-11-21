import {
    gql,
    useApolloClient,
    useMutation,
    useQuery,
    useReactiveVar,
} from "@apollo/client";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { isAdminVar, isLoggedInVar } from "../apollo";
import { useIsNotMobile } from "../hooks/mediaQueryHooks";

const SEE_ROOM_QUERY = gql`
    query seeRoom($id: Int!) {
        seeRoom(id: $id) {
            id
            messages {
                id
                payload
                user {
                    id
                    email
                }
                read
            }
            unreadTotal
        }
    }
`;

const ROOM_UPDATES = gql`
    subscription roomUpdates($roomId: Int!, $userId: Int!) {
        roomUpdates(roomId: $roomId, userId: $userId) {
            id
            payload
            user {
                id
                email
            }
            read
        }
    }
`;

const SEND_MESSAGE_MUTATION = gql`
    mutation sendMessage(
        $payload: String!
        $isAdmin: Boolean!
        $roomId: Int
        $userId: Int
    ) {
        sendMessage(
            payload: $payload
            isAdmin: $isAdmin
            roomId: $roomId
            userId: $userId
        ) {
            id
            ok
            userEmail
        }
    }
`;

const READ_MESSAGE_MUTATION = gql`
    mutation readMessage($userId: Int!, $roomId: Int!) {
        readMessage(userId: $userId, roomId: $roomId) {
            ok
        }
    }
`;

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: ${(props) => (props.isNotMobile ? "50px" : "0px")};
`;
const Wrapper = styled.div`
    background-color: white;
    padding: 20px 40px;
    border-radius: 15px;
    width: 100%;
    max-width: 500px;
    height: 80%;
    min-height: 600px;
    max-height: 600px;
    overflow: auto;
    display: flex;
    flex-direction: column;
`;

const Message = styled.div`
    width: 100%;
    display: flex;
    flex-direction: ${(porps) => (porps.me ? "row-reverse" : "row")};
    align-items: flex-end;
`;
const Email = styled.div`
    font-size: 15px;
`;
const MessageText = styled.div`
    padding: 10px 15px 10px 15px;
    width: fit-content;
    background-color: ${(props) => (props.me ? "#FFB231aa" : "#86bfb9aa")};
    margin-top: 5px;
    margin-bottom: 5px;
    font-size: 17px;
    color: #00000099;
    border-radius: 15px;
`;

const Form = styled.form`
    width: 97%;
    max-width: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: ${(props) => (props.isNotMobile ? "20px" : "5px")};
`;
const Input = styled.input`
    border: 1px solid black;
    border-radius: 20px;
    width: 80%;
    height: 30px;
    padding: 5px 10px 5px 10px;
`;
const Button = styled.input`
    width: 45px;
    border-radius: 20px;
    height: 30px;
    padding: 5px 10px 5px 10px;
    background-color: ${(props) =>
        props.sending ? "rgb(255,99,71,0.5)" : "rgb(255,99,71)"};
    text-align: center;
    margin-left: 10px;
    color: white;
`;

const LoadingMessage = styled.div`
    width: 100%;
    height: 80%;
    min-height: 500px;
    max-height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
`;
function Room() {
    const isNotMobile = useIsNotMobile();
    const curUserId = useReactiveVar(isLoggedInVar);
    const isAdmin = useReactiveVar(isAdminVar);
    const [firstRead, setFirstRead] = useState(true);
    const [subscribed, setSubscribed] = useState(false);
    const [readMessageMutation] = useMutation(READ_MESSAGE_MUTATION);

    const {
        state: { roomId },
    } = useLocation();

    const { data, loading, subscribeToMore } = useQuery(SEE_ROOM_QUERY, {
        variables: { id: roomId },
        fetchPolicy: "network-only",
    });

    const updateSendMessage = (cache, result) => {
        const {
            data: {
                sendMessage: { ok, id, userEmail },
            },
        } = result;
        if (ok) {
            const cacheRoomId = `Room:${roomId}`;
            const { message } = getValues();
            setValue("message", "");

            const newMessage = {
                __typename: "Message",
                id,
                payload: message,
                user: { email: userEmail },
                read: false,
            };

            const messageFragment = cache.writeFragment({
                fragment: gql`
                    fragment NewMessage on Message {
                        id
                        payload
                        user {
                            email
                        }
                        read
                    }
                `,
                data: newMessage,
            });

            cache.modify({
                id: cacheRoomId,
                fields: {
                    messages: (prev) => {
                        const existingMessage = prev.find(
                            (aMessage) =>
                                aMessage.__ref === messageFragment.__ref
                        );

                        if (existingMessage) {
                            return prev;
                        }

                        return [...prev, messageFragment];
                    },
                },
            });
        }
    };

    const [sendMessageMutation, { loading: sendingMessage }] = useMutation(
        SEND_MESSAGE_MUTATION,
        {
            update: updateSendMessage,
        }
    );

    const client = useApolloClient();
    const updateQuery = (prevQuery, options) => {
        const {
            subscriptionData: {
                data: {
                    roomUpdates: { id },
                },
            },
        } = options;

        const newMessage = options.subscriptionData.data.roomUpdates;

        if (id) {
            const incomingMessage = client.cache.writeFragment({
                fragment: gql`
                    fragment NewMessage on Message {
                        id
                        payload
                        user {
                            email
                        }
                        read
                    }
                `,
                data: newMessage,
            });

            client.cache.modify({
                id: `Room:${roomId}`,
                fields: {
                    messages(prev) {
                        const existingMessage = prev.find(
                            (aMessage) =>
                                aMessage.__ref === incomingMessage.__ref
                        );

                        if (existingMessage) {
                            return prev;
                        }
                        return [...prev, incomingMessage];
                    },
                },
            });

            readMessageMutation({
                variables: {
                    userId: curUserId,
                    roomId,
                },
            });
        }
    };

    useEffect(() => {
        if (data?.seeRoom && !subscribed) {
            subscribeToMore({
                document: ROOM_UPDATES,
                variables: {
                    roomId,
                    userId: curUserId,
                },
                updateQuery: updateQuery,
            });
            setSubscribed(true);
        }

        if (firstRead && data?.seeRoom.unreadTotal > 0) {
            readMessageMutation({
                variables: {
                    userId: curUserId,
                    roomId,
                },
            });
            setFirstRead(false);
        }

        let last = document.getElementById("last");
        last.scrollTop = last.scrollHeight;
    }, [data]);

    const { register, handleSubmit, getValues, setValue } = useForm();

    const onSubmitValid = () => {
        if (sendingMessage) {
            return;
        }

        const { message } = getValues();
        sendMessageMutation({
            variables: { payload: message, isAdmin, roomId, userId: curUserId },
        });
    };
    return (
        <Container isNotMobile={isNotMobile}>
            <Helmet>
                <title>Message | Seoul Life</title>
            </Helmet>
            <Wrapper id="last">
                {loading ? (
                    <LoadingMessage>
                        <div>메세지 가져오는 중...</div>
                    </LoadingMessage>
                ) : (
                    data?.seeRoom?.messages.map((message, index) => (
                        <Message
                            key={message.id}
                            me={message.user.id === curUserId ? true : false}
                        >
                            <div>
                                {message.user.id === curUserId ? null : (
                                    <Email>{message.user.email}</Email>
                                )}

                                <MessageText
                                    me={
                                        message.user.id === curUserId
                                            ? true
                                            : false
                                    }
                                >
                                    {message.payload}
                                </MessageText>
                            </div>
                        </Message>
                    ))
                )}
            </Wrapper>

            <Form
                onSubmit={handleSubmit(onSubmitValid)}
                isNotMobile={isNotMobile}
            >
                <Input
                    type="text"
                    {...register("message", {
                        required: true,
                    })}
                    placeholder="메세지를 입력하세요."
                />
                <Button
                    type="submit"
                    value={sendingMessage ? "전송중" : "전송"}
                    sending={sendingMessage}
                />
            </Form>
        </Container>
    );
}

export default Room;
