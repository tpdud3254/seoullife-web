import { gql, useQuery, useReactiveVar } from "@apollo/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { isLoggedInVar } from "../apollo";

const SEE_ROOMS_QUERY = gql`
    query seeRooms {
        seeRooms {
            id
            unreadTotal
            users {
                id
                email
            }
        }
    }
`;

const Container = styled.div``;
const Room = styled.div``;
const Email = styled.div``;
const UnreadText = styled.div``;
const LoadingText = styled.div``;

function Rooms() {
    const curUserId = useReactiveVar(isLoggedInVar);

    const { data, loading } = useQuery(SEE_ROOMS_QUERY, {
        fetchPolicy: "network-only",
    });
    const navigate = useNavigate();

    const getEmail = (users) => {
        const result = users.filter((user) => user.id !== curUserId);
        return result[0].email;
    };

    const goToRoom = (roomId) => {
        navigate("/room", { state: { roomId } });
    };

    return (
        <Container>
            {loading ? (
                <LoadingText>loading...</LoadingText>
            ) : (
                data?.seeRooms.map((room) => (
                    <Room key={room.id} onClick={() => goToRoom(room.id)}>
                        <Email>{getEmail(room.users)}</Email>
                        <UnreadText>{`${room.unreadTotal}개의 읽지 않은 메세지가 있습니다`}</UnreadText>
                    </Room>
                ))
            )}
        </Container>
    );
}

export default Rooms;
