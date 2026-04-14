
/**
 * 
 * IMPORTANT NOTE: 
 *  - DO NOT ADD MARGIN AND PADDING AT ALL 
 *  - THIS IS JUST FOR number format
 *  - Currency Name
 *   
 */

const AmountTotal = ({amt}) => {
  return (
    <div className="text-sm text-blue-600 w-full text-right">
      <span className="font-bold"> {Number(amt).toFixed(2)}</span>
    </div>
  );
};

export default AmountTotal;
