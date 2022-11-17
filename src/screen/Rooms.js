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
const Divider = styled.div`
    height: 1px;
    background-color: rgb(0, 0, 0, 0.5);
    width: 100%;
`;
const Room = styled.div`
    padding: 10px 50px 10px 50px;
    &:hover {
        border-radius: 10px;
        background-color: #cbdcf644;
    }
`;
const Email = styled.div`
    font-size: 15px;
`;
const UnreadText = styled.div`
    margin-top: 10px;
    font-size: 17px;
    color: ${(props) =>
        props.unreadTotal > 0 ? "tomato" : "rgb(0, 0, 0, 0.3)"};
`;
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
            <Wrapper>
                {loading ? (
                    <LoadingText>loading...</LoadingText>
                ) : (
                    data?.seeRooms.map((room, index) => (
                        <div key={room.id}>
                            <Room onClick={() => goToRoom(room.id)}>
                                <Email>{getEmail(room.users)}</Email>
                                <UnreadText
                                    unreadTotal={room.unreadTotal}
                                >{`${room.unreadTotal}개의 읽지 않은 메세지가 있습니다`}</UnreadText>
                            </Room>
                            {data.seeRooms.length === index ? null : (
                                <Divider />
                            )}
                        </div>
                    ))
                )}
            </Wrapper>
        </Container>
    );
}

export default Rooms;
