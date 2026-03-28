import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { JsonApiClient } from 'drupal-canvas';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { FormattedText } from 'drupal-canvas';

import PageTitle from '@/components/utl-page-title';
import Button from '@/components/utl-button';
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
      <PageTitle title='Invoice Copy' />

      <div>
        
        {/** DATE AND INVOICE NUMBER */}
        <div>
        <div>Date: {data[0].field_invoice_date}</div>
        <div>Invoice Number: {data[0].field_invoice_number}</div>
        </div>

        {/** CUSTOMER DETAILS */}
        <div className='my-2'>
          <div>Customer Code: {data[0].field_customer_id.field_customer_code}</div>
          <div>{data[0].field_customer_id.title}</div>
          <div>
            <FormattedText>
              {data[0].field_customer_id.field_address.value}
            </FormattedText>
          </div>
          <div className='flex'>
            <div>Phone:</div> {data[0].field_customer_id.field_phone_number?.map((item) => <div className='mx-2'>{item}</div>)}
          </div>
          <div>
            Email:  {data[0].field_customer_id.field_email}
          </div>
          <div>
            Tax Id: {data[0].field_customer_id.field_tax_id}
          </div>
        </div>

        <div className='my-2 border-t border-b'>
          <div className='flex gap-2'>
            <div className='w-96'>Product</div>
            <div className='w-12'>Qty</div>
            <div className='w-32'>Rate</div>
            <div className='w-32'>Amount</div>
          </div>
          {
            data[0].field_sales_invoice_items?.map((item) => {
              return<div key={item.id} className='flex gap-2'>
                <div className='w-96'>{item?.title}</div>
                <div className='w-12'>{item?.field_product_quantity_units}</div>
                <div className='w-32'><Amount amt={item?.field_product_unit_price} /></div>
                <div className='w-32'><Amount amt={item?.field_product_unit_price * item?.field_product_quantity_units} /></div>
              </div>
            })
          }
          <div className='flex gap-2 my-2 border-t border-slate-300'>
            <div className='w-96'>Total Amount</div>
            <div className='w-12'></div>
            <div className='w-32'></div>
            <div className='w-32'><Amount amt={data[0]?.field_total_amount} /></div>
          </div>
        </div>  

          <div className='py-2'>
            <div>Note:</div>
            <div><FormattedText>{data[0]?.field_notes?.value}</FormattedText></div>
          </div>

      </div>
    </div>
  );
}
