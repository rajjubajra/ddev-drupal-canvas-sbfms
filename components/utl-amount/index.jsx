
/**
 * 
 * IMPORTANT NOTE: 
 *  - DO NOT ADD MARGIN AND PADDING AT ALL 
 *  - THIS IS JUST FOR number format
 *  - Currency Name
 *   
 */

const Amount = ({amt}) => {
  return (
    <div className="text-sm text-blue-600">
      <span>NPR</span><span className="font-bold text-right"> {Number(amt).toFixed(2)}</span>
    </div>
  );
};

export default Amount;
