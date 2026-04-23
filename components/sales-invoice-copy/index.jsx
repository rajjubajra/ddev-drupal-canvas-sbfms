import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { JsonApiClient } from 'drupal-canvas';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { FormattedText } from 'drupal-canvas';

import PageTitle from '@/components/utl-page-title';
import Button from '@/components/utl-button';
import AmountTotal from '@/components/utl-amount-total';
import Amount from '@/components/utl-amount';




const client = new JsonApiClient();






export default function sales_invoice_copy() {


/**----------------------------------------------------------------
 *  UUID FROM THE SALES LIST
 ------------------------------------------------------------------*/  
    const [nodeId, setNodeId] = useState('');
      
      useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('nodeId');
        console.log('Node Id : ',id);
          setNodeId(id);
      },[])

/**----------------------------------------------------------------------
 * FETCH data for invoice copy from content type 'invoice'
 ------------------------------------------------------------------------*/
      const { data, error, isLoading } = useSWR(
            [
              'node--invoice',
              {
                queryString: new DrupalJsonApiParams()
                  .addInclude([
                    'field_sales_invoice_items',
                    'field_customer_id'
                    ])
                  .addFilter('drupal_internal__nid', nodeId, '=') // Exclude current article by uuid.
                  .getQueryString(),
              },
            ],
            ([type, options]) => client.getCollection(type, options),
      );
      console.log('DATA', data, error, isLoading);



   
  if(error) return <div>Loading error...</div>
  if(isLoading) return <div>Loading ...</div>

  return (
    <div>
      <div className='flex justify-end'>
        <Button>
        <button className='cursor-pointer' onClick={() => window.history.back()}>
             ← Back 
        </button>
        </Button>
      </div>

      
      <PageTitle title='Invoice Copy' />

      <div>
        
    {/** Invoice number, date ---------------------------------------------------------- */}
        <div className='flex justify-between py-4 border-b border-slate-300'>
          <div>
            <div className='font-bold'>Invoice - {data[0].field_invoice_number}</div>
            <div className='text-xs'>{data[0].field_invoice_date}</div>
          </div>
          <div>
            <div className='text-xs'>{data[0].field_customer_id.field_customer_code}</div>
          </div>
        </div>


    {/** Client Details ----------------------------------------------------------------*/}
        <div className='grid md:grid-cols-2 py-4 border-b border-slate-300'>
          <div>
              <div className='font-semibold'>{data[0].field_customer_id.title}</div>
              <div className='text-xs'>
                <FormattedText>
                  {data[0].field_customer_id.field_address.value}
                </FormattedText>
              </div>
          </div>
          
          <div className='text-xs border-l border-slate-300 pl-4'>
              <div className='flex gap-2'>
                {data[0].field_customer_id.field_phone_number?.map((item) => <div>{item}</div>)}
              </div>
              <div>
                {data[0].field_customer_id.field_email}
              </div>
              <div>
                Tax Id: {data[0].field_customer_id.field_tax_id}
              </div>
          </div>
        </div>


        

        <div className='my-2'>
          <div className='flex gap-2 border-b border-slate-300'>
            <div className='w-96'>Product</div>
            <div className='w-12'>Qty</div>
            <div className='w-32 text-right'>Rate</div>
            <div className='w-32 text-right'>Amount</div>
          </div>
          {
            data[0].field_sales_invoice_items?.map((item) => {
              return<div key={item.id} className='flex gap-2 border-b border-slate-300 py-1'>
                <div className='w-96'>{item?.title}</div>
                <div className='w-12'>{item?.field_product_quantity_units}</div>
                <div className='w-32'><Amount amt={item?.field_product_unit_price} /></div>
                <div className='w-32'><Amount amt={item?.field_product_unit_price * item?.field_product_quantity_units} /></div>
              </div>
            })
          }
          <div className='flex gap-2 py-2 border-t border-b border-slate-300'>
            <div className='w-96'></div>
            <div className='w-12'></div>
            <div className='w-32 uppercase text-xs flex justify-end items-center'>Total Amount</div>
            <div className='w-32 text-lg text-right'><AmountTotal amt={data[0]?.field_total_amount} /></div>
          </div>
        </div>  

          <div className='py-2 border-b border-slate-300'>
            <div>Note:</div>
            <div><FormattedText>{data[0] ? data[0]?.field_notes?.value : '---'}</FormattedText></div>
          </div>

      </div>
    </div>
  );
}
