import {
    ApolloClient,
    createHttpLink,
    InMemoryCache,
    makeVar,
    split,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

const ID = "ID";
const ADMIN = "ADMIN";
export const isLoggedInVar = makeVar(Number(localStorage.getItem(ID)) || null);
export const isAdminVar = makeVar(
    localStorage.getItem(ADMIN) === "true" ? true : false
);

export const logUserIn = (userId) => {
    localStorage.setItem(ID, userId);
    isLoggedInVar(userId);
};

export const setAdminVar = (bool) => {
    localStorage.setItem(ADMIN, bool);
    isAdminVar(bool);
};

const wsLink = new GraphQLWsLink(
    createClient({
        url:
            process.env.NODE_ENV === "production"
                ? "wss://instaclone-backend-ksy.herokuapp.com/graphql"
                : "ws://localhost:4001/graphql",
    })
);

// const onErrorLink = onError((graphQLErrors, networkError) => {
//     if (graphQLErrors) {
//         console.log("graphQL Error", graphQLErrors);
//     }
//     if (networkError) {
//         console.log("network Error", networkError);
//     }
// });

const httpLink = createHttpLink({
    uri:
        process.env.NODE_ENV === "production"
            ? "https://instaclone-backend-ksy.herokuapp.com/graphql"
            : "http://localhost:4001/graphql",
});

const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
        );
    },
    wsLink,
    httpLink
);

export const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache({
        typePolicies: {},
    }),
});
