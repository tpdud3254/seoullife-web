import {
    gql,
    useApolloClient,
    useMutation,
    useQuery,
    useReactiveVar,
} from "@apollo/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { isAdminVar, isLoggedInVar } from "../apollo";

const SEE_ROOM_QUERY = gql`
    query seeRoom($id: Int!) {
        seeRoom(id: $id) {
            id
            messages {
                id
                payload
                user {
                    email
                }
                read
            }
        }
    }
`;

const ROOM_UPDATES = gql`
    subscription roomUpdates($roomId: Int!, $userId: Int!) {
        roomUpdates(roomId: $roomId, userId: $userId) {
            id
            payload
            user {
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

function Room() {
    const curUserId = useReactiveVar(isLoggedInVar);
    const isAdmin = useReactiveVar(isAdminVar);
    const [subscribed, setSubscribed] = useState(false);

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
                    roomUpdates: {
                        id,
                        payload,
                        user: { email },
                    },
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
        }
    };

    useEffect(() => {
        if (data?.seeRoom && !subscribed) {
            console.log(roomId, curUserId);
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
    }, [data]);

    const {
        register,
        watch,
        handleSubmit,
        formState,
        getValues,
        setValue,
        setError,
        clearErrors,
    } = useForm();

    const onSubmitValid = (data) => {
        if (sendingMessage) {
            return;
        }

        const { message } = getValues();

        sendMessageMutation({
            variables: { payload: message, isAdmin, roomId, userId: curUserId },
        });
    };
    return (
        <div>
            {data?.seeRoom?.messages.map((message) => (
                <ul key={message.id}>
                    <li>
                        {message.user.email} / {message.payload}
                    </li>
                </ul>
            ))}
            <form onSubmit={handleSubmit(onSubmitValid)}>
                <input
                    type="text"
                    {...register("message", {
                        required: true,
                    })}
                />
                <input type="submit" />
            </form>
        </div>
    );
}

export default Room;
