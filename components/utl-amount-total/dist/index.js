import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 
 * IMPORTANT NOTE: 
 *  - DO NOT ADD MARGIN AND PADDING AT ALL 
 *  - THIS IS JUST FOR number format
 *  - Currency Name
 *   
 */ const AmountTotal = ({ amt })=>{
    return /*#__PURE__*/ _jsx("div", {
        className: "text-sm text-blue-600 w-full text-right",
        children: /*#__PURE__*/ _jsxs("span", {
            className: "font-bold",
            children: [
                " ",
                Number(amt).toFixed(2)
            ]
        })
    });
};
export default AmountTotal;
