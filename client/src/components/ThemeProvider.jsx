import PropTypes from "prop-types";
import { useSelector } from "react-redux";

export default function ThemeProvider({ children }) {
    const { theme } = useSelector((state) => state.theme);
    return (
        <div className={theme}>
            <div className="bg-white text-black dark:text-white dark:bg-[rgb(14,14,14)] min-h-screen">
                {children}
            </div>
        </div>
    );
}

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
