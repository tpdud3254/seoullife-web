import { useMediaQuery } from "react-responsive";

export const useDesktopMediaQuery = () => useMediaQuery({ minWidth: 992 });

export const useTabletMediaQuery = () =>
    useMediaQuery({ minWidth: 768, maxWidth: 991 });

export const useMobileMediaQuery = () => useMediaQuery({ maxWidth: 767 });

export const useIsNotMobile = () => useMediaQuery({ minWidth: 768 });
