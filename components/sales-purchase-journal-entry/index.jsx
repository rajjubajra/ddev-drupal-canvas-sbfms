import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { JsonApiClient } from 'drupal-canvas';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { FormattedText } from 'drupal-canvas';

import PageTitle from '@/components/utl-page-title';
import Button from '@/components/utl-button';
import Amount from '@/components/utl-amount';

const client = new JsonApiClient();

export default function PurchaseJournalEntry() {



 /**--------------------------------------------------------------------------------------------
  * Extract UUID from URL query parameters and fetch the corresponding purchase data via JSON:API.
  * Then display the purchase details and provide a button to post a journal entry for the purchase.
  -------------------------------------------------------------------------------------------*/
  const [uuid, setUuid] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uuidParam = params.get('uuid');
    console.log('URL params:', window.location.search);
    console.log('UUID from URL:', uuidParam);
    setUuid(uuidParam);
  }, []);

  console.log('UUID state:', uuid);
  const shouldFetch = typeof uuid === 'string' && uuid.trim().length > 0;
  console.log('Should Fetch:', shouldFetch);



  /**---------------------------------------------------------------------
   * fetch purchase data for the given UUID using SWR. 
   * 
   -----------------------------------------------------------------------*/
  const { data, error, isLoading } = useSWR(
    shouldFetch
      ? `node--purchase_book--${uuid}`
      : null,
    async () => {
      console.log('Fetching individual resource:', uuid);
      try {
        const res = await fetch(`${window.location.origin}/jsonapi/node/purchase_book/${uuid}?include=field_product_name,field_product_brand,field_product_code,field_product_company,field_product_size,field_sales_department,field_sku,field_vendor`);
        console.log('Fetch response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const data_1 = await res.json();
        console.log('Fetched data:', data_1);
        return data_1;
      } catch (err) {
        console.error('Fetch error:', err);
        throw err;
      }
    }
  );

  console.log('SWR Data:', data?.data?.attributes);
  console.log('SWR Include:', data?.included);
  console.log('SWR Error:', error);
  console.log('SWR Loading:', isLoading);



 // Get CSRF token
  async function getCsrfToken() {
      try {
        const response = await fetch("/session/token", {
          method: "GET",
          credentials: "include"
        });
        
        if (!response.ok) {
          throw new Error(`Failed to get CSRF token: ${response.status}`);
        }
        
        return await response.text();
      } catch (error) {
        console.error("CSRF token error:", error);
        throw error;
      }
    }


  async function postJournalForPurchase(item) {

    console.log('Posting journal entry for purchase item:', item);
    
    try {
      const token = await getCsrfToken();
      const today = new Date().toISOString().split('T')[0];

      console.log('Token:', token);
      
      // Total Purchase Amount
      const totalAmount = item.field_quantity * item.field_cost_price;

      // Reference (link back to purchase)
      const refId = item.drupal_internal__nid;

      const journalEntry = {
        data: {
          type: 'node--acc_journal_entry',
          attributes: {
            title: `Inventory Purchase - ${item?.field_product_name?.name}`,
            field_amount: totalAmount,
            field_date: today,
            field_purchase_sale_reference_id: refId,
            field_purchase_sale_reference_ty: 'purchase',
            field_description: {
              value: `Purchased ${item.field_quantity} box(es) of ${item?.field_product_name?.name}`,
              format: 'plain_text'
            },
            field_comment: {
              value: `Auto generated purchase entry`,
              format: 'plain_text'
            }
          },
          relationships: {
            // Debit → Inventory
            field_debit_account: {
              data: {
                type: "node--accounting_ledger",
                id: "c5343609-65ee-4e0d-926e-20104956edd9"
              }
            },
            // Credit → Cash OR Accounts Payable
            field_credit_account: {
              data: {
                type: "node--accounting_ledger",
                id: "0f92cdfb-9533-47fb-8951-c882369e59bd"
              }
            }
          }
        }
      };

      // POST
      const res = await fetch('/jsonapi/node/acc_journal_entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'X-CSRF-Token': token
        },
        credentials: 'include',
        body: JSON.stringify(journalEntry)
      });

      const responseData = await res.json();

      // Get created nodeId (nid)
      const nodeId = responseData?.data?.attributes?.drupal_internal__nid;

      // Redirect to Journal Entry Page
      if (nodeId) {
        window.location.href = `/acc-journal-entry?nodeId=${nodeId}`;
      }

    } catch (err) {
      console.error('Purchase Journal Error:', err);
    }
    
  }



  return (
    <div>
      <PageTitle title="Purchase - Journal Entry" />

      {isLoading && <p>Loading...</p>}
      {error && (
        <div>
          <p>Error loading data</p>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      
        <div>
        
            <div className='py-2 my-2 border-b border-slate-300'>
              <div>Invoice date: {data?.data?.attributes?.field_invoice_date}</div>
              <div>Purchase date: {data?.data?.attributes?.field_received_date}</div>

              {/* Product Details */}
              <div className='mt-4'>Product Details:</div>
              {
                data?.included && 
                data?.included?.length > 0 && 
                data?.included?.map((inc) => (
              <div key={inc.id}>
                <div className='flex gap-2'>
                 <div>{inc.type
                 .replace('taxonomy_term--', '')
                 .replace('product_', '')
                 .replace('_', ' ')
                 .replace('node--vendor', '')
                 .toUpperCase()} :</div>  
                 <div>{inc?.attributes?.name}</div>
                </div>  
              </div>
              ))
              }
              
              

              {/** Purchase Cost and Trade Value */}  
              <div className='py-2'>
                <div className='uppercase text-xs font-semibold'>Purchased Quantity and Value</div>
                <div className='border border-slate-300 p-2'>
                  <div className='grid grid-cols-5 gap-2'>
                    <div>Purchased Qty<br />[Box/Case]</div>
                    <div>Purchase<br />Price per unit</div>
                    <div>Purchased Price<br />[Box/Case]</div>
                    <div>Purchased Cost</div>
                    <div>Trade Value</div>
                  </div>
                  <div className='grid grid-cols-5 gap-2 text-center'>
                    <div className='text-center'>
                      {data?.data?.attributes?.field_quantity}<br />
                      <span className='text-xs'>[ in units: {data?.data?.attributes?.field_quantity * data?.data?.attributes?.field_unit_per_box}]</span>
                    </div>
                    <div className='text-center'><Amount amt={data?.data?.attributes?.field_cost_price / data?.data?.attributes?.field_unit_per_box} /></div>
                    <div className='text-center'><Amount amt={data?.data?.attributes?.field_cost_price} /></div>
                    <div className='text-center'><Amount amt={data?.data?.attributes?.field_quantity * data?.data?.attributes?.field_cost_price} /></div>
                    <div className='text-center'><Amount amt={data?.data?.attributes?.field_quantity * data?.data?.attributes?.field_selling_price} /></div>
                  </div>
                </div>
              </div>
              

              {/* Units Per Box/Case */}
              <div className='p-2 border border-slate-300'>
                <div className='uppercase text-sm font-bold'>
                  Units Per Box/Case: {data?.data?.attributes?.field_unit_per_box}
                </div>
              </div>
              

              {/* Vendor Details */}
              { 
                data?.included 
                && data?.included?.length > 0 
                && data?.included?.map((inc) => (
                inc.type === 'node--vendor' && 

                <div key={inc.id} className='py-2'>
                    <div className='uppercase text-xs font-semibold'>Vendor : {inc?.attributes?.field_date}</div>
                    <div>{inc?.attributes?.title}</div>
                    <div className='text-sm'>
                      <div><FormattedText>{inc?.attributes?.field_address?.value}</FormattedText></div>
                      <div>Email: {inc.attributes?.field_email}</div>
                      <div>Phone: {inc?.attributes?.field_phone_number?.join(' | ')}</div>
                      <div>Contact Person: {inc?.attributes?.field_contact_person?.join(' | ')}</div>
                    </div>
                </div>
                ))
              }
              


              {/* Journal Entry Post Button */}
              <div className='py-2'>
                <button
                  className='cursor-pointer px-4 py-2 border bg-slate-600 text-white'
                  onClick={() => postJournalForPurchase(data?.data?.attributes)}
                >
                  Post Journal Entry
                </button>
              </div>
              


            </div>
          
        </div>
      

      {!data && <p>No purchase data found for the given UUID.</p>}
    </div>
  );
}