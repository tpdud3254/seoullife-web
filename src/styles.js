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
