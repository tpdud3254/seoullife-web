import { useMediaQuery } from "react-responsive";
import { createGlobalStyle } from "styled-components";
import { reset } from "styled-reset";

//global style - body 전체에 적용
export const GlobalStyles = createGlobalStyle`
    ${reset}
    input {
        all:unset //input에 적용된 기본 스타일 리셋
    }

    * { // * 는 전체 요소에 적용됨
        box-sizing: border-box;
    }

    body {
        background-color:white;
        font-size: 14px;
        font-family:'Open Sans', sans-serif;
        color:black
    }

    a {
        text-decoration: none;
        color:inherit;
    }
`;

export const Desktop = ({ children }) => {
    const isDesktop = useMediaQuery({ minWidth: 992 });
    return isDesktop ? children : null;
};
export const Tablet = ({ children }) => {
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });
    return isTablet ? children : null;
};

export const Mobile = ({ children }) => {
    const isMobile = useMediaQuery({ maxWidth: 767 });
    return isMobile ? children : null;
};

export const Default = ({ children }) => {
    const isNotMobile = useMediaQuery({ minWidth: 768 });
    return isNotMobile ? children : null;
};
