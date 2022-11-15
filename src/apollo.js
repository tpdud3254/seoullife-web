import {
    ApolloClient,
    createHttpLink,
    InMemoryCache,
    makeVar,
} from "@apollo/client";

export const isLoggedInVar = makeVar(null);
export const isAdminVar = makeVar(false);

export const logUserIn = (userId) => {
    isLoggedInVar(userId);
};

export const setAdminVar = (bool) => {
    isAdminVar(bool);
};

const httpLink = createHttpLink({
    uri: "http://localhost:4001/graphql",
});

export const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache({
        typePolicies: {},
    }),
});
