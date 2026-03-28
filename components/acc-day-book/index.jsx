import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { JsonApiClient } from 'drupal-canvas';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

import PageTitle from '@/components/utl-page-title';
import Amount from '@/components/utl-amount';
import Button from '@/components/utl-button';

/* --------------------------------------------------
   Drupal JSON:API Client
-------------------------------------------------- */
const client = new JsonApiClient();


export default function DayBook() {
  
  
   /* --------------------------------------------------
     State: Date Filters (default = defined fiscal year)
  -------------------------------------------------- */

  const [datePickedFrom, setDatePickedFrom] = useState('');
  const [datePickedTo, setDatePickedTo] = useState('');
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');


      /* --------------------------------------------------
           Fetch: Financial Year
        -------------------------------------------------- */
        const { data:fy, error:fyError, isLoading:fyIsLoading } = useSWR(
          [
            'node--financial_year',
            {
              queryString: new DrupalJsonApiParams()
                .addSort(['-created'])
                .getQueryString(),
            },
          ],
          ([type, options]) => client.getCollection(type, options)
        );
      
        useEffect(() => {
          if (!fy || fy.length === 0) return;

          if (!datePickedFrom && !datePickedTo) {
            setDateFrom(fy[0].field_date_from);
            setDateTo(fy[0].field_date_to);
          } else {
            setDateFrom(datePickedFrom);
            setDateTo(datePickedTo);
          }
        }, [fy, datePickedFrom, datePickedTo]);

  

  /* --------------------------------------------------
     Fetch: Journal Entries (filtered by date range)
  -------------------------------------------------- */
  const { data, error, isLoading } = useSWR(
    [
      'node--acc_journal_entry',
      dateFrom,
      dateTo,
      {
        queryString: new DrupalJsonApiParams()
          .addInclude([
            'field_credit_account.field_account_type',
            'field_debit_account.field_account_type',
          ])
          .addFilter('field_date', dateFrom, '>=')
          .addFilter('field_date', dateTo, '<=')
          .addSort(['-field_date'])
          .getQueryString(),
      },
    ],
    ([type, , , options]) => client.getCollection(type, options)
  );

  /* --------------------------------------------------
     Export filtered data to CSV
  -------------------------------------------------- */
  const exportToCSV = () => {
    if (!data) return;

    const headers = [
      'Date',
      'Title',
      'Debit Ledger Name',
      'Debit Account Type',
      'Debit Amount',
      'Credit Ledger Name',
      'Credit Account Type',
      'Credit Amount',
    ];

    const rows = data.map((entry) => [
      entry.field_date,
      entry.title,
      entry.field_debit_account.field_ledger_account_name,
      entry.field_debit_account.field_account_type.name,
      entry.field_amount,
      entry.field_credit_account.field_ledger_account_name,
      entry.field_credit_account.field_account_type.name,
      entry.field_amount,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'day-book.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

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
      {/* Page Header & Export Button */}
      <div className="flex gap-10 items-center mb-4">
        

        <button onClick={exportToCSV}>
          <Button>Export CSV</Button>
        </button>
      </div>

      {/* Date Filter Form */}
      <form
        className="flex flex-wrap gap-4 mb-6 p-4 border"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label className="block text-sm font-semibold mb-1">Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
      </form>

      <PageTitle title="Day Book" />

      {/* Table Header */}
      
      {/*-------------------------------------------
      * Desktop View 
      -----------------------------------------------*/}
      
        <div className="flex text-xs uppercase gap-1">
          <div className="w-28 border-b">Date</div>
          <div className="w-52 border-b">Title</div>

          <div className="w-52 border-b">Debit Ledger Name</div>
          <div className="w-28 border-b">Account Type</div>
         
          <div className="w-52 border-b">Credit Ledger Name</div>
          <div className="w-28 border-b">Account Type</div>
          <div className="w-28 border-b">Amount</div>
          <div className="w-28 border-b">Link to Journal</div>
        </div>

      {/*--- Journal Entry Rows-----------------------------------*/}

      {data?.length === 0 && (
        <div className="mt-4 text-gray-500">No entries found</div>
      )}
      
      {data?.map((entry) => (
      <div key={entry.id} className='flex text-sm gap-1'>
          <div className="w-28 border-b">
            {entry.field_date}
          </div>
          <div className="w-52 border-b">
            {entry.title}
          </div>
          <div className="w-52 border-b">
            {entry.field_debit_account.field_ledger_account_name}
          </div>
          <div className="w-28 border-b">
            {entry.field_debit_account.field_account_type.name}
          </div>
          
          <div className="w-52 border-b">
            {entry.field_credit_account.field_ledger_account_name}
          </div>
          <div className="w-28 border-b">
            {entry.field_credit_account.field_account_type.name}
          </div>
          <div className="w-28 border-b">
            <Amount amt={entry.field_amount} />
          </div>
          <div className="w-28 border-b flex justify-center item-center">
            <a className='border' href={`/acc-journal-entry/?nodeId=${entry.drupal_internal__nid}`}>
            JRN</a>
          </div>
      </div>
      ))}
      </div>

  );

}
