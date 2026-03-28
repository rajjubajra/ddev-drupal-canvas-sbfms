import { useState, useEffect } from 'react';
import useSWR from 'swr';

import { JsonApiClient, FormattedText, Image } from 'drupal-canvas';

import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

import Button from '@/components/utl-button';
import PageTitle from '@/components/utl-page-title';
import Amount from '@/components/utl-amount';

/* --------------------------------------------------
   Drupal JSON:API Client
-------------------------------------------------- */
const client = new JsonApiClient()



export default function JournalEntry() {


  const [jourId, setJourId] = useState([]);
  
  useEffect(() => {   
    const params = new URLSearchParams(window.location.search);
    console.log('PARAMS: ',params);

      const idsParam = params.get('nodeId'); // e.g. "12,13"
        if (idsParam) {
          const idsArray = idsParam.split(',').map(id => Number(id));
          setJourId(idsArray);
        }
  },[])
  
  
  /* --------------------------------------------------
       Fetch: Journal Entries
  -------------------------------------------------- */
    
    //const isReady = jourId !== null && jourId !== undefined && jourId !== '';

    const isReady = Array.isArray(jourId) && jourId.length > 0;
    
    const params = new DrupalJsonApiParams()
      .addInclude([
        'field_debit_account',
        'field_credit_account',
        'field_image_image.field_media_image',
      ]);
    
   

    if (isReady) {
      params.addFilter('drupal_internal__nid', jourId, 'IN');
    }


    const { data, error, isLoading } = useSWR(
        isReady
          ? [
              'node--acc_journal_entry',
              jourId.join(','), // unique key
              { queryString: params.getQueryString() },
            ]
          : null,
        ([type, , options]) => client.getCollection(type, options)
      );

     console.log('JOURNAL ENTRIES : ',data);
    
  /* --------------------------------------------------
     Render States
  -------------------------------------------------- */
  if (error) return 'An error has occurred.';
  if (isLoading) return 'Loading...';

  /* --------------------------------------------------
     Render UI
  -------------------------------------------------- */
  return (
    <div>
      <PageTitle title="Journal Entries" />
      <div></div>

    {/* BACK AN DCREATE NEW BUTTON ------------------------------------------ */}
      <div className="w-full flex justify-end mb-4 gap-2">
        <button onClick={() => window.history.back()}>
            <Button> ← Back </Button>
        </button>

        <a href="/node/add/acc_journal_entry">
          <Button>Create Journal Entry</Button>
        </a>
      </div>

      {/* Journal Entry List */}
      { data?.map((entry) => (
        <div
          key={entry?.id}
          className="my-2 py-4 border-b-2 border-slate-500">


{/** DATA AND EDIT BUTTON -------------------------------------------------*/}
          <div className='flex justify-between'>
            <div>Date: {entry?.field_date}</div>
            <div className='flex gap-2'>
              <a href={`/node/${entry?.drupal_internal__nid}/edit?destination=/admin/content`}><Button>Edit</Button></a>             
            </div>
          </div>

{/** DESCRIPTION --------------------------------------------------------- */}
          <div className="my-2 mx-4 border-l border-slate-400 pl-4">
            <div className="mt-2 text-xs font-bold uppercase">
              Description
            </div>
            <FormattedText>
              {entry?.field_description?.processed}
            </FormattedText>
          </div>

{/** COMMENT ----------------------------------------------------------------- */}
          <div className="my-2 mx-4 border-l border-slate-400 pl-4">
            <div className="mt-2 text-xs font-bold uppercase">
              Comment
            </div>
            <FormattedText>{entry?.field_comment?.processed}</FormattedText>
          </div>

{/** TITLE - JOURNAL POST ----------------------------------------------------------------- */}
        <div className='text-xs'>Jouran Post title: {entry?.title}</div>


{/** DEBIT SECTION --------------------------------------------------*/}
          <div className="flex flex-wrap md:justify-between my-4">
            {/* Debit */}
            <div>
              <div className="font-semibold">Debit</div>
              <div className="mx-4 pl-4 border-l border-slate-400">
                <div>
                  <a href={`/acc-ledger-book?ledgerId=${entry?.field_debit_account?.id}`}>
                  {
                    entry?.field_debit_account?.field_ledger_account_name
                  }
                  </a>
                </div>
                <Amount
                  amt={entry?.field_amount}
                />
              </div>
            </div>

{/** CREDIT SECTION --------------------------------------------- */}
            {/* Credit */}
            <div>
              <div className="font-semibold">Credit</div>
              <div className="mx-4 pl-4 border-l border-slate-400">
                <div>
                  <a href={`/acc-ledger-book?ledgerId=${entry?.field_credit_account?.id}`}> 
                  {
                    entry?.field_credit_account?.field_ledger_account_name
                  }
                  </a>
                </div>
                <Amount
                  amt={entry?.field_amount}
                />
              </div>
            </div>
          </div>


{/** IMAGE : SECTION */}
          <div className='flex'>
            { entry?.field_image_image &&
              entry?.field_image_image?.map((img) => 
            <a href={img?.field_media_image?.uri?.url} target='_blank'>
              <Image
               className='w-64 h-auto p-2 m-2 border border-slate-300'
               src={img?.field_media_image?.uri?.url}
               alt='supporting image' 
               width={1000}
               height={500}
               unoptimized />
            </a>
            )
            }
          </div>

{/**----------------------------------------------------------- 
 * REFERENCE UUID FROM INVOICE AND PURCHASE AUTO-POSTING :
 * ----------------------------------------------------------*/}
          <div className='text-xs'>

           { 
           entry?.field_purchase_sale_reference_ty ?
            <div>
              {
                entry?.field_purchase_sale_reference_ty === 'purchase'
                ? <a
                    className='border border-slate-300 cursor-pointer p-1'  
                    href={`/sales-purchase-item/?nodeId=${entry?.field_purchase_sale_reference_id}`}>
                    View Purchase
                  </a>
                :  <a href={`/sales-invoice-copy/?nodeId=${entry?.field_purchase_sale_reference_id}`}>Veiw Invoice</a>
              }
            </div>
           : 'Manual Journal Entry'
           
           }
          </div>
        </div>
      ))}
    </div>
  );
}
