import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 
 * IMPORTANT NOTE: 
 *  - DO NOT ADD MARGIN AND PADDING AT ALL 
 *  - THIS IS JUST FOR number format
 *  - Currency Name
 *   
 */ const Amount = ({ amt })=>{
    return /*#__PURE__*/ _jsxs("div", {
        className: "text-sm text-blue-600",
        children: [
            /*#__PURE__*/ _jsx("span", {
                children: "NPR"
            }),
            /*#__PURE__*/ _jsxs("span", {
                className: "font-bold text-right",
                children: [
                    " ",
                    Number(amt).toFixed(2)
                ]
            })
        ]
    });
};
export default Amount;
